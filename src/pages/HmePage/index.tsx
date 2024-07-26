import { Layout } from 'antd';
import HomeHeader from '@/components/HomePage/header';

const { Sider, Content } = Layout;
const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    height: '100%',
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#0958d9',
};
  
const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#1677ff',
};

const layoutStyle: React.CSSProperties = {
    height: 'calc(100vh - 100px)'
};

export default () => {
    return (
        <Layout style={layoutStyle}>
            <HomeHeader />
            <Layout>
                <Content style={contentStyle}>聊天区</Content>
                <Sider width="25%" style={siderStyle}>
                    配置区
                </Sider>
            </Layout>
        </Layout>
    )
}