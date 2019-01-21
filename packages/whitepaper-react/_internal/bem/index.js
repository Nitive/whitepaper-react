import React from 'react'
import PropTypes from 'prop-types'
import { block as bemCn } from 'bem-cn'
import kebab from 'kebab-case'

function mapKeys(obj, f) {
    const newObj = {}

    Object.keys(obj).forEach(key => {
        newObj[f(key)] = obj[key]
    })

    return newObj
}

function pickOmitObj(obj, keys) {
    const picked = {}
    const omited = {}

    Object.keys(obj).forEach(key => {
        if (keys.indexOf(key) !== -1) {
            picked[key] = obj[key]
        } else {
            omited[key] = obj[key]
        }
    })

    return [picked, omited]
}

function cn(block, elem, mods, mix) {
    return bemCn(block)(elem, mapKeys(mods, kebab)).mix(mix).toString()
}

export function Bem({ tag, block, elem, modNames, className, mix, getHtml, attrs, ...props }) {
    const [mods, attrProps] = pickOmitObj(props, modNames)
    const [MixComponent, mixProps] = mix || []
    const Tag = MixComponent || tag || 'div'
    const html = getHtml && getHtml(props)

    return (
        <Tag
            {...mixProps}
            {...attrProps}
            {...attrs}
            tag={tag}
            className={cn(block, elem, mods, className)}
            dangerouslySetInnerHTML={html && { __html: html }}
        />
    )
}

Bem.propTypes = {
    tag: PropTypes.any, // component or string
    block: PropTypes.string.isRequired,
    elem: PropTypes.string,
    modNames: PropTypes.arrayOf(PropTypes.string),
    mix: PropTypes.array,
}
