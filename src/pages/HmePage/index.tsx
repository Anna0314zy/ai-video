
import HomeHeader from '@/components/HomePage/header';
import StompSocket from '@/utils/stompSocket'
import ChatContainer from '@/components/HomePage/chatContainer';
import ChatEnter from '@/components/HomePage/chatEnter';
import { CheckCircleOutlined } from '@ant-design/icons';
import IconWidget from '@/components/IconWidget';
import { Layout, Tag, Button } from 'antd';
import { createContext } from 'react'
import { SEND_THOROUGH, SUBSCRIBE_THOROUGH } from '@/const/socket'
import Styles from '@/components/HomePage/index.module.less'
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

const leftChildren = () => {
    return (
        <>
            <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }} />
            <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《高尔基的童年》</span>
            <span className={Styles['tip-shu']}> | </span>
            <span className={Styles['tip-text']}> 剧本设计</span>
            <Tag style={{ width: 68, marginLeft: 12 }} icon={<CheckCircleOutlined />} color="success">
                已确认
            </Tag>
        </>
    )
}

const rightChildren = () => {
    return (
        <>
            <Button>跳过</Button>
            <Button type='primary'>下一步</Button>
        </>
    )
}

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
                <HomeHeader leftChildren={leftChildren} rightChildren={rightChildren} />
                <Layout>
                    <Content style={contentStyle}>
                        <ChatContainer />
                        <ChatEnter />
                    </Content>
                    <Sider width="30%" style={sliderStyle}>
                        配置区
                    </Sider>
                </Layout>
            </Layout>
        </MyContext.Provider>

    )
}