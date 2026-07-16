import Header from './Header'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import SessionSidebar from './Chat/SessionSidebar'
import { Layout, message } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import useScriptSocket, { ScriptSocketPayload } from '@/hooks/useScriptSocket'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@/api/types/script'
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
  const [streamScrollKey, setStreamScrollKey] = useState(0)
  const streamBufferRef = useRef('')
  const streamFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamActiveRef = useRef(false)
  const currentStreamRef = useRef<{
    sessionId?: number
    requestId?: string
  }>({})

  const stopCurrentStream = useCallback(
    (notice?: string, options?: { showInterruptedMessage?: boolean }) => {
      const interruptedSessionId = currentStreamRef.current.sessionId
      if (streamFlushTimerRef.current) {
        clearTimeout(streamFlushTimerRef.current)
        streamFlushTimerRef.current = null
      }
      streamBufferRef.current = ''
      streamActiveRef.current = false
      currentStreamRef.current = {}
      setChatIngText('')
      dispatch.aiScript.updateData({
        chatIng: false,
      })
      if (options?.showInterruptedMessage && interruptedSessionId) {
        dispatch.aiScript.addMessage({
          id: uuidv4(),
          sessionId: interruptedSessionId,
          role: Role.Gpt,
          messageType: 'interrupted',
          messageContent: convertToMarkdown('本次输出已中断，请重新生成。'),
          created: Date.now(),
        })
      }
      if (notice) message.warning(notice)
    },
    [dispatch],
  )

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
    stopCurrentStream()
    //  如果信息失败
    if (message.payload.isSuccess === true) {
      dispatch.aiScript.updateChatingMessage({
        ...message.payload,
        messageContent: convertToMarkdown(message.payload.messageContent || ''),
      })
      dispatch.aiScript.getSessionList({
        projectId: Number(id),
      })
    }
  }, [dispatch, id, isCurrentStreamMessage, stopCurrentStream])
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

  const { sendChat, resendMessage, connected } = useScriptSocket({
    onChunk: socketCallback,
    onCompleted: chatEndSocketCallback,
    onScriptAdded: addScriptSuccess,
  })

  useEffect(() => {
    if (connected || !streamActiveRef.current) return
    stopCurrentStream('连接已断开，本次输出已中断，请重新生成', { showInterruptedMessage: true })
  }, [connected, stopCurrentStream])

  const sendWithRequestId = useCallback(
    (sender: (params: ScriptSocketPayload) => boolean, params: ScriptSocketPayload) => {
      const requestId = uuidv4()
      currentStreamRef.current = {
        sessionId: params.sessionId,
        requestId,
      }
      setChatIngText('')
      setStreamScrollKey(key => key + 1)
      streamBufferRef.current = ''
      const sent = sender({
        ...params,
        requestId,
      })
      if (sent) {
        streamActiveRef.current = true
      } else {
        streamActiveRef.current = false
        currentStreamRef.current = {}
      }
      return sent
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

  const handleInterruptOutput = useCallback(() => {
    stopCurrentStream('本次输出已中断，请重新生成', { showInterruptedMessage: true })
  }, [stopCurrentStream])

  return (
    <Layout style={layoutStyle}>
      <Header />
      <Layout style={{ height: '100%' }}>
        <Sider width={260} style={{ backgroundColor: '#fff' }}>
          <SessionSidebar />
        </Sider>
        <Content style={contentStyle}>
          <ChatContent
            chatIngText={chatIngText}
            streamScrollKey={streamScrollKey}
            onResend={handleResendMessage}
          />
          <ChatControl connected={connected} onSend={handleSendChat} onInterrupt={handleInterruptOutput} />
        </Content>
        <Sider width={'24.4vw'} style={sliderStyle}>
          <RightPanel></RightPanel>
        </Sider>
      </Layout>
    </Layout>
  )
}
