import { useState, useContext, useEffect } from 'react'
import { Layout, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import * as api from '@/api/models/video'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import Styles from './index.module.less'

export default () => {
  const [data, setData]: any = useState({ records: [] })
  const dispatch = useDispatch()
  const { currentSelectType, selectedImage } = useSelector((state: any) => state.aiVideo)
  // 触底加载状态
  const [isBottomStatus, setIsBottomStatus] = useState(false)
  useEffect(() => {
    getResourceList()
  }, [currentSelectType])
  const getResourceList = (pageIndex?: number) => {
    api.getResourceList({ shotId: 1, pageSize: 10, pageIndex: pageIndex || 1, type: currentSelectType }).then(res => {
      let newArr: any = {
        records: [
          {
            resourceId: 1,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 2,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 3,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 4,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 5,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 6,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 7,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 8,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 9,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
          {
            resourceId: 10,
            type: 'video',
            name: 'VIDEO_10_11_1_1',
            originUrl: '/img2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            compressUrl: '/newImg2video/eb40b93b-e0b0-449a-a592-22cbd9ed681c.mp4',
            isFinal: 'notFinal',
            modified: '2024-08-14T16:15:31',
          },
        ],
        total: 0,
        size: 0,
        current: 0,
      }
      // 往里追加数据
      setData(newArr)
      console.log('%c 🚀 ~ [ res ]-196', 'font-size:14px; background:green; color:#fff;', res)
      setIsBottomStatus(false)
    })
  }
  const onChangeGetNewData = () => {
    // if (data?.total / 10 === data?.pageIndex) return
    getResourceList(data?.pageIndex + 1)
  }
  return (
    <Layout.Sider className='page-storyboard-right'>
      <Tabs
        onTabClick={key => {
          const isSelectImage = key === 'image' && Object.keys(selectedImage).length
          dispatch.aiVideo.updateData({ currentSelectType: isSelectImage ? 'video' : key })
          console.log('%c 🚀 ~ [ key ]-78', 'font-size:14px; background:green; color:#fff;', key)
          // setSelectedType(key)
        }}
        className={Styles['storyboard-tab']}
        defaultActiveKey='image'
        centered
        items={[
          {
            label: <div>画面</div>,
            key: 'image',
            children: <StoryboardVideo data={data.records} onChangeGetNewData={() => onChangeGetNewData()} />,
          },
          {
            label: <div>旁白</div>,
            key: 'voice',
            children: <StoryboardAudio data={data.records} />,
          },
        ]}
      />
    </Layout.Sider>
  )
}
