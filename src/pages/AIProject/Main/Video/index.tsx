import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import { createContext, useEffect, useMemo, useState, useRef } from 'react'
import { ShotList, ChatMessageList } from '@/api/types/video'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import * as api from '@/api/models/video'
import StompSocket from '@/utils/stompSocket'
import { SEND_THOROUGH, TEXT_TO_IMAGE_THOROUGH } from '@/const/socket'
import { ResourceType, EnumUploadType } from '@/api/types/video'
import useControlMsg from './useControlMsg'
interface Context {
  messageList: ChatMessageList[]
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
const VideoProcess = () => {
  const { messageList, getMessageList, addChatTask, searchParams, hasMore } = useControlMsg()
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)
  const { shotList } = useSelector((state: RootState) => state.aiVideo)

  const { id } = useParams() // 获取路由参数 userId
  const dispatch = useDispatch<Dispatch>()
  // 当前选中的是图片 视频 还是音频
  const [selectedType, setSelectedType] = useState<ResourceType>(EnumUploadType['IMAGE'])

  // 选中的id
  const [curId, setCurId] = useState<number>()
  useEffect(() => {
    dispatch.common.getPathConfig()
    dispatch.auth.getUserInfo()
    dispatch.aiVideo.getShotListByProjectId(Number(id))
  }, [])
  const contextValue = {
    curId,
    setCurId,
    selectedType,
    setSelectedType,
    projectId: Number(id),
    messageList,
    getMessageList,
    addChatTask,
    searchParams,
    hasMore,
  }
  let stompSocket = useRef<any>(null)
  useEffect(() => {
    if (!accountId) return
    stompSocket.current = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: SEND_THOROUGH,
      subscribeThorough: `${TEXT_TO_IMAGE_THOROUGH}/${accountId}`,
    })
    console.log('subscribeThorough', `${TEXT_TO_IMAGE_THOROUGH}/${accountId}`)
    stompSocket.current.on('onSubscribe', (message: any) => {
      console.log('onSubscribe', message, JSON.parse(message.body))
    })
    return () => {
      stompSocket.current.unsubscribe()
    }
  }, [accountId])

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
