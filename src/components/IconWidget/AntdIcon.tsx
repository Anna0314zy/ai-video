import React, { useState, useEffect } from 'react'
import AntdIcon from '@ant-design/icons'
// 创建一个类型来描述 iconModules 对象
type IconModules = {
  [path: string]: {
    ReactComponent: any
    default: string
  }
}
// import add from './Icons/add.svg'
const iconModules: IconModules = import.meta.glob('./Icons/*.svg', { eager: true })

// 使用类型断言来确保 iconModules 是正确的类型
const icons: { [key: string]: any } = {}

if (Object.keys(iconModules).length === 0) {
  console.warn('No SVG files found in the specified directory.')
} else {
  for (const path in iconModules) {
    const iconName = path.split('/').pop()?.replace('.svg', '') || ''
    icons[iconName] = iconModules[path].ReactComponent
  }
}
console.log('icons', icons)
interface IconProps {
  icon: string
  classname?: string
  style?: React.CSSProperties
  onClick?: (e?: any) => void
  onMouseDown?: (e?: any) => void
}

export default function Icon(props: IconProps) {
  return (
    <AntdIcon
      component={icons[props.icon]}
      onClick={props?.onClick}
      onMouseDown={props?.onMouseDown}
      color={'#fff'}
      className={props.classname}
      style={props.style}
    />
  )
}
