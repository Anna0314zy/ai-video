import { useState, useContext, useEffect, useMemo } from 'react'
import { Layout, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as api from '@/api/models/aiVideo'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import { videoTabIcon, settingIcon } from '@/components/IconWidget/Icons'
import { EnumUploadType, ResourceType } from '@/api/types/video'
import './index.less'
import { RootState, Dispatch } from '@/store'

export default () => {
  // const [data, setData]: any = useState({ records: [], total: 100, size: 10, current: 1 })
  const dispatch = useDispatch<Dispatch>()
  const { currentSelectType, selectedImage, resourceList, currentShotId, selectedShot, shotList } = useSelector(
    (state: RootState) => state.aiVideo,
  )

  const currentShot = useMemo(() => {
    return shotList.find(item => item.shotId === currentShotId)
  }, [currentShotId])

  useEffect(() => {}, [resourceList.length])
  // 触底加载状态
  useEffect(() => {
    if (!currentShotId) return
    getResourceList()
  }, [currentShotId, currentSelectType])

  const getResourceList = (pageIndex?: number) => {
    dispatch.aiVideo.getResourceList({
      shotId: currentShotId,
      pageIndex: pageIndex || 1,
      type: currentSelectType,
    })
  }

  const onChangeGetNewData = (pageIndex?: number) => {
    console.log('%c 🚀 ~ [ pageIndex ]-34', 'font-size:14px; background:green; color:#fff;', pageIndex)

    getResourceList(pageIndex)
    // getResourceList()
  }

  return (
    <Layout.Sider className='page-storyboard-right'>
      <Tabs
        onTabClick={key => {
          if (key === 'voice') {
            dispatch.aiVideo.updateData({ currentSelectType: key as ResourceType, isShowResult: false })
          } else {
            dispatch.aiVideo.updateData({
              currentSelectType: currentShot?.imageStatus === 'completed' ? 'video' : 'image',
              isShowResult: false,
            })
          }
        }}
        activeKey={currentSelectType !== 'voice' ? 'image' : 'voice'}
        centered
        items={[
          {
            label: <div className='tab-icon'>{videoTabIcon()}画面</div>,
            key: EnumUploadType['IMAGE'],
            children: (
              <StoryboardVideo
                data={resourceList?.records || []}
                onChangeGetNewData={(pageIndex: number) => onChangeGetNewData(pageIndex)}
              />
            ),
          },
          {
            label: <div className='tab-icon'>{settingIcon()}旁白</div>,
            key: EnumUploadType['AUDIO'],
            children: (
              <StoryboardAudio
                data={resourceList?.records || []}
                onChangeGetNewData={(pageIndex: number) => onChangeGetNewData(pageIndex)}
              />
            ),
          },
        ]}
      />
    </Layout.Sider>
  )
}
