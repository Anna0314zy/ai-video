import Header from './Header'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout, Button } from 'antd'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import * as api from '@/api/models/main'
import { getProjectDetail as getDetail } from '@/api/models/project'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
import { MessageList, ScriptPageList, ScriptStatus } from '@/api/types/script'
import { MyContext } from './MyContext'
import useStompSocket from '@/hooks/useStompSocket'
import { SCRIPT_SUBSCRIBE_THOROUGH, SCRIPT_SEND_THOROUGH, SCRIPT_END_SUBSCRIBE_THOROUGH } from '@/const/socket'
import useTyped from './hooks/useTyped'
import { throttle } from 'lodash-es'
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
  width: '24.4vw',
}

const layoutStyle: React.CSSProperties = {
  height: '100%',
}

export default () => {
  const { id } = useParams() // 获取路由参数 userId
  const projectName = getQueryParam('projectName')
  const subjectName = getQueryParam('subjectName')
  const [sessionId, setSessionId] = useState<number>()
  const [currentState, setCurrentState] = useState<keyof typeof ScriptStatus>('ScriptProcessing')
  const [messageList, setMessageList] = useState<MessageList[]>([])
  const containerRef = useRef<any>()
  const [scriptPageList, setScriptPageList] = useState<ScriptPageList[]>([])
  const [chatIng, setChatIng] = useState(false)
  const typeRef = useRef<any>()
  const contentMessagesRef = useRef<HTMLDivElement>(null)
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
  const getProjectDetail = async () => {
    const { latestSessionId, project } = await getDetail(Number(id))
    console.log('zy getProjectDetail', latestSessionId, project)
    setSessionId(latestSessionId || 0)
    if (!latestSessionId) {
      handleCreateChat()
    }
    // setProject(project)
    setCurrentState(project.state)
  }
  useEffect(() => {
    getProjectDetail()
    getScriptPageList()
  }, [])
  const { typedText } = useTyped()
  const [chatIngText, setChatIngText] = useState<string>('')

  const socketCallback = (message: any) => {
    console.log('socketCallback', message, typeRef)
    setChatIngText(prev => {
      const newText = convertToMarkdown(prev + message.payload)
      return newText
    })
  }

  const chatEndSocketCallback = (message: any) => {
    console.log('%c SCRIPT_END_SUBSCRIBE_THOROUGH socketCallback', 'color:red', message)
    setChatIng(false)
    setChatIngText('')
    setMessageList(prevList => {
      // 删除最后一条消息
      const updatedList = prevList.slice(0, -1)

      // 添加新消息
      updatedList.push({
        ...message.payload,
        messageContent: convertToMarkdown(message.payload.messageContent || ''),
      })

      return updatedList
    })
  }
  const { stompSocket } = useStompSocket([
    {
      path: SCRIPT_SUBSCRIBE_THOROUGH,
      callback: socketCallback,
    },
    {
      path: SCRIPT_END_SUBSCRIBE_THOROUGH,
      callback: chatEndSocketCallback,
    },
  ])

  const contextValue = {
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
    currentState,
    disabled,
    chatIng,
    setChatIng,
    messageList,
    typeRef,
    contentMessagesRef,
    getProjectDetail,
    stompSocket,
  }
  useEffect(() => {
    setTimeout(() => {
      if (contentMessagesRef.current) contentMessagesRef.current.scrollTop = contentMessagesRef.current.scrollHeight
    }, 300)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messageList]) // 依赖于 messages，当 messages 更新时触发

  return (
    <MyContext.Provider value={contextValue}>
      <Layout style={layoutStyle}>
        <Header />
        <Layout style={{ height: '100%' }}>
          <Content style={contentStyle}>
            <ChatContent
              containerRef={containerRef}
              messageList={messageList}
              contentMessagesRef={contentMessagesRef}
              chatIngText={chatIngText}
              chatIng={chatIng}
            />
            <ChatControl containerRef={containerRef} />
          </Content>
          <Sider width={'24.4vw'} style={sliderStyle}>
            <RightPanel></RightPanel>
          </Sider>
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
