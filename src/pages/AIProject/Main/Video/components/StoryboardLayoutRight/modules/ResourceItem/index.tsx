import { FC } from 'react'
import type { MenuProps } from 'antd'
import { Flex, Dropdown } from 'antd'
import { useSelector } from 'react-redux'
import { fileIcon, videoIcon, voiceIcon, downIcon, moreIcon } from '@/components/IconWidget/Icons'

import AntdIcon from '@/components/IconWidget/AntdIcon'
import './index.less'

const ResourceItem: FC<any> = props => {
  const { actived, onClick, data, onHandleDeleteResourceItem } = props
  const { currentSelectType } = useSelector((state: any) => state.aiVideo)
  const imageIconEnum: any = {
    image: fileIcon,
    video: videoIcon,
    voice: voiceIcon,
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Flex>
          <AntdIcon style={{ fontSize: '20px' }} icon='preview'></AntdIcon>
          <span style={{ marginLeft: '8px' }}>预览</span>
        </Flex>
      ),
    },
    {
      key: '2',
      label: (
        <Flex
          onClick={() => {
            // delResourceItem
            onHandleDeleteResourceItem()
            console.log('%c 🚀 ~ [  ]-23', 'font-size:14px; background:green; color:#fff;', '删除资源')
          }}>
          <AntdIcon style={{ fontSize: '20px' }} icon='delete'></AntdIcon>
          <span style={{ marginLeft: '8px' }}>删除</span>
        </Flex>
      ),
    },
  ]
  console.log(
    '%c 🚀 ~ [ process.env.VITE_CDN_SERVER ]-44',
    'font-size:14px; background:green; color:#fff;',
    // process.env.VITE_CDN_SERVER,
    // VITE_CDN_SERVER ='https://ai-tool-static-test.ledupeiyou.com'
    // process,
  )
  return (
    <div className={`resource-item pointer ${actived ? 'actived' : 'unactived'}`} onClick={() => onClick()}>
      <div className='resource-item__icon f-center'>{imageIconEnum[currentSelectType]()}</div>
      <div className='resource-item__content '>
        <span className='one-line-ellipsis'>{data?.name}</span>
        <span>{data?.modified}</span>
      </div>
      <div className='resource-item__operation'>
        <span>{downIcon()}</span>
        <Dropdown menu={{ items }} placement='bottomRight' arrow={{ pointAtCenter: true }}>
          <span>{moreIcon()}</span>
        </Dropdown>
      </div>
    </div>
  )
}
export default ResourceItem
