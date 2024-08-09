import Header from './Header'
import StompSocket from '@/utils/stompSocket'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout, Button } from 'antd'
import { createContext, useEffect, useRef, useState, useMemo } from 'react'
import { SEND_THOROUGH, SUBSCRIBE_THOROUGH } from '@/const/socket'
import { MessageList, ScriptPageList, ScriptStatus } from '@/api/type'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import * as api from '@/api/models/main'
import { getProjectDetail } from '@/api/models/project'
import { setEngine } from 'crypto'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
interface Context {
  projectId: number
  sessionId: number
  scriptPageList: ScriptPageList[]
  state: keyof typeof ScriptStatus
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
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
  const { id } = useParams() // 获取路由参数 userId
  const projectName = getQueryParam('projectName')
  const subjectName = getQueryParam('subjectName')
  const sessionIdQuery = getQueryParam('sessionId')
  const state = getQueryParam('state')
  const [sessionId, setSessionId] = useState<number>(Number(sessionIdQuery))
  const [messageList, setMessageList] = useState<MessageList[]>([])
  const containerRef = useRef<any>()
  const [scriptPageList, setScriptPageList] = useState<ScriptPageList[]>([])
  const [chatIng, setChatIng] = useState(false)
  const typeRef = useRef<any>()
  const disabled = useMemo(() => {
    return scriptPageList.findIndex(v => v.isFinal) > -1
  }, [scriptPageList])
  //剧本列表
  const getScriptPageList = async () => {
    const res = await api.getPageScript({ projectId: Number(id) })
    setScriptPageList(
      res.records.map(v => ({
        ...v,
        actived: v.isFinal,
      })),
    )
  }
  const getChatHistories = async () => {
    if (!sessionId) return
    typeRef.current?.destroy()
    const res = await api.getChatHistories({ sessionId })
    console.log('getChatHistories res', res)
    setMessageList(
      res.records.map(v => {
        return {
          ...v,
          messageContent: convertToMarkdown(v.messageContent || ''),
        }
      }),
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
    setMessageList(messageList => {
      // 将 data 转换成数组形式以统一处理
      const dataArray = Array.isArray(data) ? data : [data]
      // 更新消息列表
      const updatedList = messageList.map(v => {
        const updatedMessage = dataArray.find(d => d.id === v.id)
        return updatedMessage ? Object.assign(v, updatedMessage) : v
      })
      // 添加新的消息
      const newMessages = dataArray.filter(d => !messageList.some(v => v.id === d.id))

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
  //项目详情
  const getDetail = async () => {
    const { latestSessionId, project } = await getProjectDetail(Number(id))
    console.log('zy getDetail', latestSessionId, project)
    setSessionId(latestSessionId || 0)
    if (!latestSessionId) {
      handleCreateChat()
    }
  }
  useEffect(() => {
    getDetail()
    getScriptPageList()
    // if (!sessionId) handleCreateChat()
  }, [])
  const contextValue = {
    // form,
    containerRef,
    updateMessage,
    projectName,
    projectId: Number(id),
    subjectName,
    sessionId: Number(sessionId),
    getChatHistories,
    handleCreateChat,
    getScriptPageList,
    setScriptPageList,
    scriptPageList,
    state: state as keyof typeof ScriptStatus,
    disabled,
    chatIng,
    setChatIng,
    messageList,
    typeRef,
  }
  useEffect(() => {
    containerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [messageList])
  console.log('zy 上下文 contextValue', contextValue)
  return (
    <MyContext.Provider value={contextValue}>
      <Layout style={layoutStyle}>
        <Header />
        <Layout style={{ height: '100%' }}>
          <Content style={contentStyle}>
            <ChatContent containerRef={containerRef} messageList={messageList} />
            <ChatControl containerRef={containerRef} />
          </Content>
          <Sider width={352} style={sliderStyle}>
            <RightPanel></RightPanel>
          </Sider>
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
