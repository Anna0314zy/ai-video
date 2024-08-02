import Header from './Header'
import StompSocket from '@/utils/stompSocket'
import ChatContainer from './Chat/chatContainer'
import ChatEnter from './Chat/chatEnter'
import { CheckCircleOutlined } from '@ant-design/icons'
import IconWidget from '@/components/IconWidget'
import { Layout, Tag, Button } from 'antd'
import { createContext } from 'react'
import { SEND_THOROUGH, SUBSCRIBE_THOROUGH } from '@/const/socket'
import { DesignType, IData } from './type'
export const MyContext = createContext<{ data: IData }>({
  data: {
    name: '',
    type: 1,
  },
})
const { Sider, Content } = Layout
const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  height: '100%',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
}

const sliderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
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
  const contextValue = { data }
  const stompSocket = new StompSocket({
    baseUrl: import.meta.env.VITE_SOCKET_BASE,
    sendThorough: SEND_THOROUGH,
    subscribeThorough: SUBSCRIBE_THOROUGH,
  })
  stompSocket.on('onSubscribe', message => {
    console.log(message)
  })

  return (
    <MyContext.Provider value={contextValue}>
      <Layout style={layoutStyle}>
        <Header data={data} />
        <Layout style={{ height: '100%' }}>
          <Content style={contentStyle}>
            <ChatContainer />
            <ChatEnter />
          </Content>
          <Sider width='30%' style={sliderStyle}>
            配置区
          </Sider>
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
