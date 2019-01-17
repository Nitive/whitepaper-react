#!/usr/bin/env node
const fs = require('mz/fs')
const path = require('path')
const glob = require('fast-glob')
const { pascal, camel } = require('case')
const mkdirp = require('mz-modules/mkdirp');

const separators = {
    element: '__',
    mod: '_'
}

function flatten(arr) {
    return arr.reduce((acc, x) => [...acc, ...x], [])
}

function asyncMap(arr, f) {
    return Promise.all(arr.map(f))
}

function collectModsNames(dir) {
    return glob('_*', { cwd: dir, onlyDirectories: true, ignore: ['__*'] })
}

function collectElementsNames(dir) {
    return glob('__*', { cwd: dir, onlyDirectories: true })
}

function collectAssets(dir) {
    return glob('**/*.*', { cwd: dir, onlyFiles: true, ignore: ['**/*.md', '**/*.js'] })
}

function parseModPropType(values) {
    if (values.every(v => typeof v === 'boolean')) {
        return 'boolean'
    }

    return `oneOf([${values.map(v => `'${v}'`).join(', ')}])`
}

async function collectModInfo(modDir, { blockName, elementName }) {
    const assets = await collectAssets(modDir)
    const name = path.basename(modDir).slice(separators.mod.length)
    const values = assets
        .filter(asset => path.extname(asset) === '.css')
        .map(asset => {
            const value = asset
                .replace(blockName, '')
                .replace(separators.element, '')
                .replace(elementName || '', '')
                .replace(separators.mod, '')
                .replace(/\.post\.css$/, '')
                .split(separators.mod)[1]

            return value === undefined ? true : value
        })

    return {
        type: 'mod',
        name,
        assets,
        propType: parseModPropType(values),
    }
}

async function collectMods(dir, opts) {
    const modsFolders = await collectModsNames(dir)
    return asyncMap(modsFolders, async modFolder => collectModInfo(path.join(dir, modFolder), opts))
}

async function collectElementInfo(elementDir, { blockName }) {
    const name = path.basename(elementDir).slice(separators.element.length)
    const mods = await collectMods(elementDir, { blockName, elementName: name })
    const assets = await collectAssets(elementDir)

    return {
        type: 'element',
        name,
        mods,
        assets
    }
}

async function collectElements(dir, opts) {
    const elementsFolders = await collectElementsNames(dir)
    return asyncMap(elementsFolders, async elementFolder => collectElementInfo(path.join(dir, elementFolder), opts))
}

async function collectBlockInfo(dir) {
    const name = path.basename(dir)
    const elements = await collectElements(dir, { blockName: name })
    const mods = await collectMods(dir, { blockName: name })
    const assets = await collectAssets(dir)

    return {
        type: 'block',
        name,
        mods,
        elements,
        assets,
    }
}

function uniteAssets(block) {
    return [
        ...block.assets,
        ...flatten(block.mods.map(mod => mod.assets.map(asset => path.join(separators.mod + mod.name, asset))))
    ]
}

function generateClassName(block) {
    const prefix = {
        block: ``,
        element: `'${block.name}'`,
    }[block.type]
    const modPairs = block.mods.map(mod => `    '${mod.name}': props.${camel(mod.name)},`)

    if (!modPairs.length) {
        return [
            `  const className = b(${prefix})`,
        ]
    }

    return [
        `  const className = b(${prefix && `${prefix}, ` || ''}{`,
        ...modPairs,
        `  })`,
    ]
}

function generateCssImports(block) {
    return uniteAssets(block)
        .filter(filePath => path.extname(filePath) === '.css')
        .map(filePath => `import './${filePath}'`)
}

function generateModsPropTypes(block) {
    return block.mods.map(mod => {
        return `  ${camel(mod.name)}: PropTypes.${mod.propType},`
    })
}

function getClassForElement(block, element) {
    return pascal(block.name) + pascal(element.name)
}

const commonImports = [
    `import React from 'react'`,
    `import PropTypes from 'prop-types'`,
    `import { block } from 'bem-cn';`,
]

function stringifyBlock(block) {
    const componentName = pascal(block.name)
    const elementsExports = block.elements.map(element => `export { ${getClassForElement(block, element)} } from './${element.name}'`)

    return [
        ...commonImports,
        ``,
        ...generateCssImports(block),
        ``,
        `const b = block('${block.name}')`,
        ``,
        `export function ${componentName}(props) {`,
        `  const Tag = props.tag || 'div'`,
        ...generateClassName(block),
        ``,
        `  return <Tag className={className}>{props.children}</Tag>`,
        `}`,
        ``,
        `${componentName}.propTypes = {`,
        `  tag: PropTypes.string,`,
        `  className: PropTypes.string,`,
        ...generateModsPropTypes(block),
        `}`,
        ``,
        ...elementsExports,
        ``,
    ].join('\n')
}

function stringifyElement(block, element) {
    const componentName = getClassForElement(block, element)

    return [
        ...commonImports,
        ``,
        ...generateCssImports(element),
        ``,
        `const b = block('${block.name}')`,
        ``,
        `export function ${componentName}(props) {`,
        `  const Tag = props.tag || 'div'`,
        ...generateClassName(element),
        ``,
        `  return <Tag className={className}>{props.children}</Tag>`,
        `}`,
        ``,
        `${componentName}.propTypes = {`,
        `  tag: PropTypes.string,`,
        `  className: PropTypes.string,`,
        ...generateModsPropTypes(element),
        `}`,
        ``,
    ].join('\n')
}

async function readDeps(depsFilePath) {
    const fileContent = await fs.readFile(depsFilePath, 'utf-8')
    const deps = eval(fileContent)[0]
    return deps.mustDeps
        .map(({ block, element, mods }) => {
            const modName = Object.keys(mods)[0]
            const modValue = mods[modName]

            return `${block}/_${modName}/${block}_${modName}_${modValue}`
        })
}

async function collectAssetDeps(asset) {
    const depsFilePath = asset.replace('.post.css', '') + '.deps.js'
    
    if (await fs.exists(depsFilePath)) {
        return readDeps(depsFilePath)
    }

    return []
}

function copyModsAssets(sourceDir, destDir, block) {
    return asyncMap(uniteAssets(block), async asset => {
        const source = path.join(sourceDir, asset)
        const dest = path.join(destDir, asset)
        const deps = await collectAssetDeps(source)

        await mkdirp(path.dirname(dest))

        if (deps.length) {
            if (path.extname(asset) !== '.css') {
                throw new Error('Unexpected dependency')
            }

            const newFileContent = [
                ...deps.map(dep => `@import '../../${dep}.post.css';`),
                '',
                await fs.readFile(source, 'utf-8')
            ].join('\n')

            fs.writeFile(dest, newFileContent, 'utf-8')
        } else {
            await fs.copyFile(source, dest)
        }
    })
}

async function generateReactComponent(blockAbsolutePath) {
    const blockInfo = await collectBlockInfo(blockAbsolutePath)

    const block = stringifyBlock(blockInfo)
    const elements = blockInfo.elements.map(element => ({ ...element, content: stringifyElement(blockInfo, element) }))

    const blockDir = path.join(__dirname, '../whitepaper-react', blockInfo.name)
    await mkdirp(blockDir)
    await Promise.all([
        fs.writeFile(`${blockDir}/index.js`, block),
        copyModsAssets(
            blockAbsolutePath,
            blockDir,
            blockInfo
        ),
        asyncMap(elements, async element => {
            const elementDir = `${blockDir}/${element.name}`
            await mkdirp(elementDir)
            await Promise.all([
                fs.writeFile(`${elementDir}/index.js`, element.content),
                copyModsAssets(
                    path.join(blockAbsolutePath, separators.element + element.name),
                    elementDir,
                    element
                ),
            ])
        }),
    ])
}

async function generateReactComponents() {
    const blocks = await glob(`*`, {
        cwd: path.join(__dirname, '../../node_modules/whitepaper-bem'),
        onlyDirectories: true,
        absolute: true
    })
    await asyncMap(blocks, generateReactComponent)
    console.log('Success!   ')
}

generateReactComponents()
    .catch(err => console.error('Error!', err))
