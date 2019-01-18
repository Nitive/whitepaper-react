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

function cn(block, elem, mods, mix) {
    return bemCn(block)(elem, mapKeys(mods, kebab)).mix(mix)
}

export function Bem({ tag: Tag = 'div', block, elem, mods, className, ...props }) {
    return (
        <Tag
            {...props}
            className={cn(block, elem, mods, className)}
        />
    )
}

Bem.propTypes = {
    tag: PropTypes.any, // component or string
    block: PropTypes.string.isRequired,
    elem: PropTypes.string,
    mods: PropTypes.objectOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.boolean,
        ])
    ),
}
