import { Layout, Button, message } from 'antd'
import Header from './components/Header'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import {
  IMAGE_TO_VIDEO_THOROUGH,
  TEXT_TO_IMAGE_THOROUGH,
  TTS_THOROUGH,
  PACKAGE_DOWNLOAD_THOROUGH,
} from '@/const/socket'
import useStompSocket from '@/hooks/useStompSocket'
import { packageBatch } from '@/api/models/aiVideo'
import { downloadFromServer } from '@/utils'
import { useEffect } from 'react'
const VideoProcess = () => {
  const { shotList } = useSelector((state: RootState) => state.aiVideo)
  const { id } = useParams() // 获取路由参数 userId
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    dispatch.common.getPathConfig()
    dispatch.aiVideo.getShotListByProjectId(Number(id))
  }, [])
  const socketCallback = (message: any) => {
    dispatch.aiVideo.updateMessage({
      data: message.payload,
      auto: false,
    })
  }
  const packSocketCallback = (message: any) => {
    const fileName = message.payload.split('/').pop()
    downloadFromServer(message.payload, fileName)
  }
  useStompSocket([
    {
      path: TEXT_TO_IMAGE_THOROUGH,
      callback: socketCallback,
    },
    {
      path: IMAGE_TO_VIDEO_THOROUGH,
      callback: socketCallback,
    },
    {
      path: TTS_THOROUGH,
      callback: socketCallback,
    },
    {
      path: PACKAGE_DOWNLOAD_THOROUGH,
      callback: packSocketCallback,
    },
  ])
  const handlePack = async () => {
    if (!shotList.length) return
    const shotIds = shotList.map(item => {
      return item.shotId
    })
    await packageBatch(shotIds)
    message.success('打包中...请稍后~')
  }
  return (
    <Layout className={Styles['page-storyboard']}>
      <Header>
        <Button type='primary' onClick={handlePack}>
          打包导出
        </Button>
      </Header>
      <Layout className='page-storyboard-content'>
        <StoryboardLayoutLeft />
        <StoryboardLayoutMain />
        <StoryboardLayoutRight />
      </Layout>
    </Layout>
  )
}
export default VideoProcess
