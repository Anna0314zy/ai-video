import Header from './Header'
import StompSocket from '@/utils/stompSocket'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout } from 'antd'
import { createContext, useEffect, useRef, useState } from 'react'
import { SEND_THOROUGH, SUBSCRIBE_THOROUGH } from '@/const/socket'
import { MessageList } from '@/api/type'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import * as api from '@/api/models/main'
import { setEngine } from 'crypto'
export const MyContext = createContext<any>({})
const { Sider, Content } = Layout
const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  height: '100%',
  color: '#fff',
  backgroundColor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
}

const sliderStyle: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#fff',
}

const layoutStyle: React.CSSProperties = {
  height: '100%',
}

export default () => {
  const data = {
    name: '高尔基的童年',
    type: 1,
  }
  const { id } = useParams() // 获取路由参数 userId
  const projectName = getQueryParam('projectName')
  const subjectName = getQueryParam('subjectName')
  const sessionIdQuery = getQueryParam('sessionId')
  const [sessionId, setSessionId] = useState<number>(Number(sessionIdQuery))
  const [messageList, setMessageList] = useState<MessageList[]>([])
  const containerRef = useRef<any>()

  const getChatHistories = async () => {
    const res = await api.getChatHistories({ sessionId })
    console.log('getChatHistories res', res)
    setMessageList(
      res.records.map(v => ({
        ...v,
        messageRole: v.fromUserId === 0 ? 'gpt' : 'user',
      })),
    )
  }
  useEffect(() => {
    getChatHistories()
  }, [sessionId])
  // const stompSocket = new StompSocket({
  //   baseUrl: import.meta.env.VITE_SOCKET_BASE,
  //   sendThorough: SEND_THOROUGH,
  //   subscribeThorough: SUBSCRIBE_THOROUGH,
  // })
  // stompSocket.on('onSubscribe', message => {
  //   console.log(message)
  // })
  // 更新信息
  const updateMessage = (data: MessageList | MessageList[]) => {
    console.log('%c 更新信息', 'color:red', data)
    setMessageList(messageList => {
      // 将 data 转换成数组形式以统一处理
      const dataArray = Array.isArray(data) ? data : [data]
      console.log('%c 更新信息 dataArray', 'color:red', dataArray, messageList)
      // 更新消息列表
      const updatedList = messageList.map(v => {
        const updatedMessage = dataArray.find(d => d.id === v.id)
        console.log('%c 更新信息 updatedMessage', 'color:red', updatedMessage)
        return updatedMessage ? Object.assign(v, updatedMessage) : v
      })
      console.log('%c 更新信息 updatedList', 'color:red', updatedList)
      // 添加新的消息
      const newMessages = dataArray.filter(d => !messageList.some(v => v.id === d.id))
      console.log('%c 更新信息 newMessages', 'color:red', newMessages)

      const finalList = [...updatedList, ...newMessages]
      console.log('%c 更新信息 finalList', 'color:red', finalList)
      // 更新状态
      return finalList
    })
  }
  useEffect(() => {
    console.log('%c zy messageList', 'color:blue', messageList)
  }, [messageList])
  // 新建回话
  const handleCreateChat = async () => {
    const data = await api.createChat({
      projectId: Number(id),
    })
    // getChatHistories()
    setSessionId(data)
    console.log('handleCreate sessionId', sessionId)
  }
  useEffect(() => {
    if (!sessionId) handleCreateChat()
  }, [])
  const contextValue = {
    data,
    containerRef,
    updateMessage,
    projectName,
    projectId: Number(id),
    subjectName,
    sessionId,
    handleCreateChat,
  }
  console.log('zy 上下文 contextValue', contextValue)
  return (
    <MyContext.Provider value={contextValue}>
      <Layout style={layoutStyle}>
        <Header data={data} />
        <Layout style={{ height: '100%' }}>
          <Content style={contentStyle}>
            <ChatContent containerRef={containerRef} messageList={messageList} />
            <ChatControl containerRef={containerRef} />
          </Content>
          <Sider width='30%' style={sliderStyle}>
            配置区
          </Sider>
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
