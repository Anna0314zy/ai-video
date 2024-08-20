import { Layout, Button } from 'antd'
import Header from './components/Header'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import {
  IMAGE_TO_VIDEO_THOROUGH,
  TEXT_TO_IMAGE_THOROUGH,
  TTS_THOROUGH,
  PACKAGE_DOWNLOAD_THOROUGH,
} from '@/const/socket'
import useControlMsg from './useControlMsg'
import { MyContext } from './MyContext'
import useStompSocket from '@/hooks/useStompSocket'
import { packageBatch } from '@/api/models/aiVideo'
const VideoProcess = () => {
  const currentShotId = useSelector((state: RootState) => state.aiVideo.currentShotId)
  const { messageList, getMessageList, addChatTask, updateMessage, reinstateTask } = useControlMsg()
  const { id } = useParams() // 获取路由参数 userId
  const dispatch = useDispatch<Dispatch>()
  useEffect(() => {
    dispatch.common.getPathConfig()
    dispatch.auth.getUserInfo()
    dispatch.aiVideo.getShotListByProjectId(Number(id))
  }, [])
  const contextValue = {
    projectId: Number(id),
    messageList,
    getMessageList,
    addChatTask,
    reinstateTask,
  }
  const socketCallback = (message: any) => {
    console.log('%c socketCallback', 'color:red', message)
    // 增加信息
    updateMessage(message.payload)
  }
  const packSocketCallback = (message: any) => {
    console.log('packSocketCallback', message)
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
  const handlePack = () => {
    console.log('打包')
    if (!currentShotId) return
    packageBatch([currentShotId])
  }
  return (
    <MyContext.Provider value={contextValue}>
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
    </MyContext.Provider>
  )
}
export default VideoProcess
