import React from 'react'
import type { MenuProps } from 'antd'
import { Dropdown, Flex, theme } from 'antd'
import AntdIcon from '@/components/IconWidget/AntdIcon'
const MenuLabel = ({ icon, text }: { icon: string; text: string }) => {
  const onClick = (key: string) => {
    console.log(key, 'key')
  }

  return (
    <Flex onClick={() => onClick(icon)}>
      <AntdIcon icon={icon} style={{ marginRight: '10px' }}></AntdIcon>
      <span>{text}</span>
    </Flex>
  )
}

const items: MenuProps['items'] = [
  {
    label: <MenuLabel icon='up' text='向上插入'></MenuLabel>,
    key: 'up',
  },
  {
    label: <MenuLabel icon='down' text='向下插入'></MenuLabel>,
    key: 'down',
  },
  // {
  //   label: <MenuLabel icon='clear' text='清除内容'></MenuLabel>,
  //   key: 'clear',
  // },
  // {
  //   label: <MenuLabel icon='copy' text='复制'></MenuLabel>,
  //   key: 'copy',
  // },
  {
    label: <MenuLabel icon='delete' text='删除'></MenuLabel>,
    key: 'delete',
  },
  {
    label: <MenuLabel icon='download' text='导出资源'></MenuLabel>,
    key: 'download',
  },
]

const ContentMenu = ({ children }: { children: React.ReactNode }) => {
  const {
    token: { colorBgLayout, colorTextTertiary },
  } = theme.useToken()

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      <div
        style={{
          color: colorTextTertiary,
          background: colorBgLayout,
          height: '100%',
          textAlign: 'center',
        }}>
        {children}
      </div>
    </Dropdown>
  )
}

export default ContentMenu
