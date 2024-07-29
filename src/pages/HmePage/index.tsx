
import HomeHeader from '@/components/HomePage/header';
import StompSocket from '@/utils/stompSocket'
import ChatContainer from '@/components/HomePage/chatContainer';
import ChatEnter from '@/components/HomePage/chatEnter';
import { Layout } from 'antd';
import { createContext } from 'react'
import { SEND_THOROUGH, SUBSCRIBE_THOROUGH} from '@/const/socket'
const MyContext = createContext({});


const { Sider, Content } = Layout;
const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    height: '100%',
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#FFF'
};

const sliderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    backgroundColor: '#fff',
};

const layoutStyle: React.CSSProperties = {
    height: 'calc(100vh - 60px)'
};


export default () => {
    const contextValue = {}
    const stompSocket = new StompSocket({
        baseUrl: import.meta.env.VITE_SOCKET_BASE,
        sendThorough: SEND_THOROUGH,
        subscribeThorough: SUBSCRIBE_THOROUGH

    })
    stompSocket.on('onSubscribe', (message) => {
        console.log(message)
    })
    return (
        <MyContext.Provider value={contextValue}>
            <Layout style={layoutStyle}>
                <HomeHeader />
                <Layout>
                    <Content style={contentStyle}>
                        <ChatContainer />
                        <ChatEnter/>
                    </Content>
                    <Sider width="30%" style={sliderStyle}>
                        配置区
                    </Sider>
                </Layout>
            </Layout>
        </MyContext.Provider>

    )
}