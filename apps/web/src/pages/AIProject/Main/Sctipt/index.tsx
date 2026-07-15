import Header from './Header'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout, message } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import useScriptSocket, { ScriptSocketPayload } from '@/hooks/useScriptSocket'
import { v4 as uuidv4 } from 'uuid'
const { Sider, Content } = Layout
const STREAM_FLUSH_INTERVAL = 50
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
  const dispatch = useDispatch<Dispatch>()
  const [chatIngText, setChatIngText] = useState('')
  const streamBufferRef = useRef('')
  const streamFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentStreamRef = useRef<{
    sessionId?: number
    requestId?: string
  }>({})

  const flushStreamBuffer = useCallback(() => {
    const nextContent = streamBufferRef.current
    streamBufferRef.current = ''
    streamFlushTimerRef.current = null
    if (nextContent) setChatIngText(prev => prev + nextContent)
  }, [])

  useEffect(() => {
    return () => {
      if (streamFlushTimerRef.current) clearTimeout(streamFlushTimerRef.current)
    }
  }, [])

  const isCurrentStreamMessage = useCallback((payload: any) => {
    return (
      payload &&
      payload.sessionId === currentStreamRef.current.sessionId &&
      payload.requestId === currentStreamRef.current.requestId
    )
  }, [])

  const socketCallback = useCallback((message: any) => {
    const payload = message.payload
    if (!isCurrentStreamMessage(payload)) return
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    streamBufferRef.current += payload.content || ''
    if (!streamFlushTimerRef.current) {
      streamFlushTimerRef.current = setTimeout(flushStreamBuffer, STREAM_FLUSH_INTERVAL)
    }
  }, [dispatch, flushStreamBuffer, isCurrentStreamMessage])

  const chatEndSocketCallback = useCallback((message: any) => {
    if (!isCurrentStreamMessage(message.payload)) return
    if (streamFlushTimerRef.current) {
      clearTimeout(streamFlushTimerRef.current)
      streamFlushTimerRef.current = null
    }
    streamBufferRef.current = ''
    setChatIngText('')
    dispatch.aiScript.updateData({
      chatIng: false,
    })
    //  如果信息失败
    if (message.payload.isSuccess === true) {
      dispatch.aiScript.updateChatingMessage({
        ...message.payload,
        messageContent: convertToMarkdown(message.payload.messageContent || ''),
      })
    }
  }, [dispatch, isCurrentStreamMessage])
  const addScriptSuccess = useCallback((messageData: any) => {
    //刷新剧本列表
    const messageInfo = messageData.payload
    if (messageInfo.isSuccess) {
      dispatch.aiScript.getScriptPageList({
        projectId: Number(id),
      })

      dispatch.aiScript.updateMessage({
        data: {
          ...messageInfo,
          id: messageInfo.sessionChatId,
          scriptName: messageInfo.name,
        },
      })
      message.success('剧本标记成功')
    } else {
      message.error(messageInfo.errorMsg)
    }
  }, [dispatch, id])

  const { sendChat, resendMessage, continueOutput, connected } = useScriptSocket({
    onChunk: socketCallback,
    onCompleted: chatEndSocketCallback,
    onScriptAdded: addScriptSuccess,
  })

  const sendWithRequestId = useCallback(
    (sender: (params: ScriptSocketPayload) => boolean, params: ScriptSocketPayload) => {
      const requestId = uuidv4()
      currentStreamRef.current = {
        sessionId: params.sessionId,
        requestId,
      }
      setChatIngText('')
      streamBufferRef.current = ''
      return sender({
        ...params,
        requestId,
      })
    },
    [],
  )

  const handleSendChat = useCallback(
    (params: ScriptSocketPayload) => sendWithRequestId(sendChat, params),
    [sendChat, sendWithRequestId],
  )

  const handleResendMessage = useCallback(
    (params: ScriptSocketPayload) => sendWithRequestId(resendMessage, params),
    [resendMessage, sendWithRequestId],
  )

  const handleContinueOutput = useCallback(
    (params: ScriptSocketPayload) => sendWithRequestId(continueOutput, params),
    [continueOutput, sendWithRequestId],
  )

  return (
    <Layout style={layoutStyle}>
      <Header />
      <Layout style={{ height: '100%' }}>
        <Content style={contentStyle}>
          <ChatContent
            chatIngText={chatIngText}
            onResend={handleResendMessage}
            onContinue={handleContinueOutput}
          />
          <ChatControl connected={connected} onSend={handleSendChat} />
        </Content>
        <Sider width={'24.4vw'} style={sliderStyle}>
          <RightPanel></RightPanel>
        </Sider>
      </Layout>
    </Layout>
  )
}
