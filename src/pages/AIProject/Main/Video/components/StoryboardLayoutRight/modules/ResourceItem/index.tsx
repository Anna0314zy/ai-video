import { FC, useContext } from 'react'
import type { MenuProps } from 'antd'
import { Flex, Dropdown } from 'antd'
import { useSelector } from 'react-redux'
import { downloadFromServer } from '@/utils'
import { fileIcon, videoIcon, voiceIcon, downIcon, moreIcon } from '@/components/IconWidget/Icons'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import './index.less'
const ResourceItem: FC<any> = props => {
  const dispatch = useDispatch<Dispatch>()
  const { cdnPath, ext, actived, onClick, data, onHandleDeleteResourceItem, onHandlePreviewResourceItem } = props
  const { currentSelectType, currentShotId } = useSelector((state: any) => state.aiVideo)

  const imageIconEnum: any = {
    image: fileIcon,
    video: videoIcon,
    voice: voiceIcon,
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Flex
          onClick={() => {
            onHandlePreviewResourceItem()
          }}>
          <AntdIcon style={{ fontSize: '20px' }} icon={'preview'}></AntdIcon>
          <span style={{ marginLeft: '8px' }}>预览</span>
        </Flex>
      ),
    },
    {
      key: '2',
      label: (
        <Flex
          onClick={() => {
            onHandleDeleteResourceItem()
            dispatch.aiVideo.deleteMessageByResourceId({
              resourceId: data.resourceId,
              type: data.type,
              shotId: currentShotId,
            })

            console.log('%c 🚀 ~ [  ]-23', 'font-size:14px; background:green; color:#fff;', '删除资源')
          }}>
          <AntdIcon style={{ fontSize: '20px' }} icon={'delete'}></AntdIcon>
          <span style={{ marginLeft: '8px' }}>删除</span>
        </Flex>
      ),
    },
  ]

  return (
    <div className={`resource-item pointer ${actived ? 'actived' : 'unactived'}`} onClick={() => onClick()}>
      <div className='resource-item__content'>
        <div className='resource-item__content__icon f-center'>{imageIconEnum[currentSelectType]()}</div>
        <div className='resource-item__content__name '>
          <span className='one-line-ellipsis'>{data?.name}</span>
          <span>{data?.modified.replace(/T/g, ' ')}</span>
        </div>
      </div>
      <div className='resource-item__operation'>
        <span
          onClick={() => {
            downloadFromServer(
              cdnPath +
                data.compressUrl +
                `?id=${data.resourceId}&fileName=${data.name}
                &ext=${ext}`,
              `${data.name}.${ext}`,
            )
          }}>
          {downIcon()}
        </span>
        <Dropdown menu={{ items }} placement='bottomRight' arrow={{ pointAtCenter: true }}>
          <span>{moreIcon()}</span>
        </Dropdown>
      </div>
    </div>
  )
}

export default ResourceItem
