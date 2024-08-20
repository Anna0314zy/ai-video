import { useState, useContext, useEffect } from 'react'
import { Layout, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as api from '@/api/models/aiVideo'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import Styles from './index.module.less'
import { EnumUploadType } from '@/api/types/video'
export default () => {
  // const [data, setData]: any = useState({ records: [], total: 100, size: 10, current: 1 })
  const dispatch = useDispatch()
  const { currentSelectType, selectedImage, resourceList, currentShotId } = useSelector((state: any) => state.aiVideo)

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
          const isSelectImage = key === 'image' && Object.keys(selectedImage).length
          dispatch.aiVideo.updateData({ currentSelectType: isSelectImage ? 'video' : key })
          console.log('%c 🚀 ~ [ key ]-78', 'font-size:14px; background:green; color:#fff;', key)
        }}
        className={Styles['storyboard-tab']}
        defaultActiveKey={EnumUploadType['IMAGE']}
        centered
        items={[
          {
            label: <div>画面</div>,
            key: EnumUploadType['IMAGE'],
            children: (
              <StoryboardVideo data={resourceList?.records || []} onChangeGetNewData={() => onChangeGetNewData()} />
            ),
          },
          {
            label: <div>旁白</div>,
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
