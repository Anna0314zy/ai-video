import Header from './Header'
import ChatContent from './Chat/ChatContent'
import ChatControl from './Chat/ChatControl'
import { Layout } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { convertToMarkdown } from '@/utils'
import RightPanel from './RightPanel'
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
  const dispatch = useDispatch<Dispatch>()
  const [chatIngText, setChatIngText] = useState('')
  const socketCallback = useCallback((message: any) => {
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    setChatIngText(prev => {
      return convertToMarkdown(prev + message.payload)
    })
  }, [])

  const chatEndSocketCallback = useCallback((message: any) => {
    // TODO
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
  }, [])
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

  useEffect(() => {
    if (stompSocket) dispatch.aiScript.updateData({ stompSocket })
  }, [stompSocket])

  return (
    <Layout style={layoutStyle}>
      <Header />
      <Layout style={{ height: '100%' }}>
        <Content style={contentStyle}>
          <ChatContent chatIngText={chatIngText} />
          <ChatControl stompSocket={stompSocket} chatIngText={chatIngText} />
        </Content>
        <Sider width={'24.4vw'} style={sliderStyle}>
          <RightPanel></RightPanel>
        </Sider>
      </Layout>
    </Layout>
  )
}
