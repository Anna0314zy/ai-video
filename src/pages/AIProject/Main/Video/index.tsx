import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import { IMAGE_TO_VIDEO_THOROUGH, TEXT_TO_IMAGE_THOROUGH, TTS_THOROUGH } from '@/const/socket'
import useControlMsg from './useControlMsg'
import { MyContext } from './MyContext'
import useStompSocket from '@/hooks/useStompSocket'
const VideoProcess = () => {
  const { messageList, getMessageList, addChatTask, updateMessage } = useControlMsg()
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
  }
  const socketCallback = (message: any) => {
    console.log('%c socketCallback', 'color:red', message)
    // 增加信息
    updateMessage(message.payload)
  }

  useStompSocket(TEXT_TO_IMAGE_THOROUGH, socketCallback)
  useStompSocket(IMAGE_TO_VIDEO_THOROUGH, socketCallback)
  useStompSocket(TTS_THOROUGH, socketCallback)
  return (
    <MyContext.Provider value={contextValue}>
      <Layout className={Styles['page-storyboard']}>
        <PageHeader icon='excel' status={<img src={confirm} width={68}></img>}>
          <Button type='primary'>打包导出</Button>
        </PageHeader>
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
