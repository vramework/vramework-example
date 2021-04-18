import React from 'react'
import SVG from 'react-inlinesvg'

export const useSVG = (svgName: string, color = 'currentColor', className: string = '') => {
    return <SVG
        className={className}
        src={`/svg/${svgName}`}
        cacheRequests={true}
        preProcessor={code => code.replace(/fill=".*?"/g, `fill="${color}"`).replace(/width=".*?"/g, '').replace(/height=".*?"/g, '')}
    />
}