import { useContext, useEffect } from 'react'
import { Divider, Layout, Tabs } from 'antd'
import * as api from '@/api/models/video'
import StoryboardVideo from './modules/StoryboardVideo'
import StoryboardAudio from './modules/StoryboardAudio'
import Styles from './index.module.less'

import { MyContext } from '../..'

const data = {
  size: 0,
  current: 0,
  records: [
    {
      id: 0,
      projectId: 0,
      scriptId: 0,
      shotId: 0,
      taskId: 0,
      name: '',
      originImgUrl: '',
      compressImgUrl: '',
      isFinal: 0,
      modified: '',
    },
    {
      id: 1,
      projectId: 0,
      scriptId: 0,
      shotId: 0,
      taskId: 0,
      name: '',
      originImgUrl: '',
      compressImgUrl: '',
      isFinal: 0,
      modified: '',
    },
    {
      id: 2,
      projectId: 0,
      scriptId: 0,
      shotId: 0,
      taskId: 0,
      name: '',
      originImgUrl: '',
      compressImgUrl: '',
      isFinal: 0,
      modified: '',
    },
    {
      id: 3,
      projectId: 0,
      scriptId: 0,
      shotId: 0,
      taskId: 0,
      name: '',
      originImgUrl: '',
      compressImgUrl: '',
      isFinal: 0,
      modified: '',
    },
  ],
  total: 0,
  pages: 0,
}

export default () => {
  const { setSelectedType } = useContext(MyContext)
  useEffect(() => {
    const data = api.getResourceList({ shotId: 111, size: 10, current: 1 })
    console.log('%c 🚀 ~ [ data ]-284', 'font-size:14px; background:green; color:#fff;', data)
  }, [])
  return (
    <Layout.Sider className='page-storyboard-right'>
      <Tabs
        onTabClick={key => {
          setSelectedType(key)
        }}
        className={Styles['storyboard-tab']}
        defaultActiveKey='pic'
        centered
        items={[
          {
            label: <div>画面</div>,
            key: 'pic',
            children: <StoryboardVideo data={data.records} />,
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
