import { useState, useContext, useEffect, useMemo } from 'react'
import { Layout, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as api from '@/api/models/aiVideo'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import { videoTabIcon, settingIcon } from '@/components/IconWidget/Icons'
import { EnumUploadType } from '@/api/types/video'
import './index.less'
import { RootState } from '@/store'

export default () => {
  // const [data, setData]: any = useState({ records: [], total: 100, size: 10, current: 1 })
  const dispatch = useDispatch()
  const { currentSelectType, selectedImage, resourceList, currentShotId, selectedShot, shotList } = useSelector(
    (state: RootState) => state.aiVideo,
  )

  useEffect(() => {}, [resourceList.length])
  // 触底加载状态
  useEffect(() => {
    if (!currentShotId) return
    getResourceList()
  }, [currentShotId, currentSelectType])

  const getResourceList = (pageIndex?: number) => {
    dispatch.aiVideo.getResourceList({
      shotId: currentShotId,
      pageSize: 10,
      pageIndex: pageIndex || 1,
      type: currentSelectType,
    })
  }

  const onChangeGetNewData = () => {
    if (resourceList?.total / 10 === resourceList?.pageIndex) return
    // getResourceList(resourceList?.pageIndex + 1)
    getResourceList()
  }

  return (
    <Layout.Sider className='page-storyboard-right'>
      <Tabs
        onTabClick={key => {
          dispatch.aiVideo.updateData({ currentSelectType: key })
        }}
        activeKey={currentSelectType !== 'voice' ? 'image' : 'voice'}
        centered
        items={[
          {
            label: <div className='tab-icon'>{videoTabIcon()}画面</div>,
            key: EnumUploadType['IMAGE'],
            children: (
              <StoryboardVideo data={resourceList?.records || []} onChangeGetNewData={() => onChangeGetNewData()} />
            ),
          },
          {
            label: <div className='tab-icon'>{settingIcon()}旁白</div>,
            key: EnumUploadType['AUDIO'],
            children: (
              <StoryboardAudio data={resourceList?.records || []} onChangeGetNewData={() => onChangeGetNewData()} />
            ),
          },
        ]}
      />
    </Layout.Sider>
  )
}
