import Header from './Header'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
import { MyContext } from './MyContext'
import useStompSocket from '@/hooks/useStompSocket'
import { SCRIPT_SUBSCRIBE_THOROUGH, SCRIPT_END_SUBSCRIBE_THOROUGH } from '@/const/socket'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
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
  const projectName = getQueryParam('projectName') as string
  const subjectName = getQueryParam('subjectName') as string
  const dispatch = useDispatch<Dispatch>()
  const { currentSessionId: sessionId, messageList } = useSelector((state: RootState) => state.aiScript)
  const [chatIng, setChatIng] = useState(false)
  useEffect(() => {
    console.log('%c zy messageList', 'color:blue', messageList)
  }, [messageList])

  useEffect(() => {
    dispatch.aiScript.getProjectDetail({
      projectId: Number(id),
    })
    dispatch.aiScript.getScriptPageList({
      projectId: Number(id),
    })
  }, [])
  const [chatIngText, setChatIngText] = useState<string>('')
  const socketCallback = (message: any) => {
    setChatIngText(prev => {
      const newText = convertToMarkdown(prev + message.payload)
      return newText
    })
  }

  const chatEndSocketCallback = (message: any) => {
    console.log('%c SCRIPT_END_SUBSCRIBE_THOROUGH socketCallback', 'color:red', message)
    setChatIng(false)
    setChatIngText('')

    const data = messageList.filter(v => !v.requesting)
    dispatch.aiScript.deleteLastMessage({})
    console.log(data, messageList, 'data----')
    dispatch.aiScript.updateMessageList({
      ...message.payload,
      messageContent: convertToMarkdown(message.payload.messageContent || ''),
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
    projectName,
    projectId: Number(id),
    subjectName,
    chatIng,
    setChatIng,
    stompSocket,
  }

  return (
    <MyContext.Provider value={contextValue}>
      <Layout style={layoutStyle}>
        <Header />
        <Layout style={{ height: '100%' }}>
          <Content style={contentStyle}>
            <ChatContent messageList={messageList} chatIngText={chatIngText} chatIng={chatIng} sessionId={sessionId} />
            <ChatControl />
          </Content>
          <Sider width={'24.4vw'} style={sliderStyle}>
            <RightPanel></RightPanel>
          </Sider>
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
