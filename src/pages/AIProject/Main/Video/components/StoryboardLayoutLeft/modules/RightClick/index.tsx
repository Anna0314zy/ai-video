import React from 'react'
import type { MenuProps } from 'antd'
import { Dropdown, Flex, theme } from 'antd'
import AntdIcon from '@/components/IconWidget/AntdIcon'
// import { scriptIcon } from '@/components/IconWidget/Icons'

const RightClick = ({
  onInster,
  onDelete,
  onDownload,
  children,
}: {
  onInster: (type: string) => void
  onDelete: () => void
  onDownload: () => void
  children: React.ReactNode
}) => {
  const {
    token: { colorBgLayout, colorTextTertiary },
  } = theme.useToken()

  const MenuLabel = ({ icon, text }: { icon: string; text: string }) => {
    const onHandleEvent = (key: string) => {
      switch (key) {
        case 'up':
        case 'down':
          onInster(key)
          break
        case 'delete':
          onDelete()
          break
        case 'download':
          onDownload()
          break
      }
    }
    return (
      <Flex onClick={() => onHandleEvent(icon)}>
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

export default RightClick
