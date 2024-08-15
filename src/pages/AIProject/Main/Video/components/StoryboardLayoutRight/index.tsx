import { useState, useContext, useEffect } from 'react'
import { Layout, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as api from '@/api/models/video'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import Styles from './index.module.less'
import { EnumUploadType } from '@/api/types/video'
export default () => {
  const [data, setData]: any = useState({ records: [], total: 100, size: 10, current: 1 })
  const dispatch = useDispatch()
  const { currentSelectType, selectedImage } = useSelector((state: any) => state.aiVideo)

  // 触底加载状态
  useEffect(() => {
    getResourceList()
  }, [currentSelectType])

  const getResourceList = (pageIndex?: number) => {
    api.getResourceList({ shotId: 1, pageSize: 10, pageIndex: pageIndex || 1, type: currentSelectType }).then(res => {
      if (pageIndex) {
        setData({ ...res, records: [...data['records'], ...res['records']] })
      } else {
        setData(res)
      }
    })
  }

  const onChangeGetNewData = () => {
    if (data?.total / 10 === data?.pageIndex) return
    getResourceList(data?.pageIndex + 1)
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
            children: <StoryboardVideo data={data?.records || []} onChangeGetNewData={() => onChangeGetNewData()} />,
          },
          {
            label: <div>旁白</div>,
            key: EnumUploadType['AUDIO'],
            children: <StoryboardAudio data={data?.records} />,
          },
        ]}
      />
    </Layout.Sider>
  )
}
