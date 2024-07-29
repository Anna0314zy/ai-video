import { Button, Tag, Layout } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

const { Header } = Layout;
const headerStyle: React.CSSProperties = {
    color: '#fff',
    height: 64,
    padding: '0 24px',
    lineHeight: '64px',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
};

const homeTagStyle: React.CSSProperties = {
    width: 100,
    height: 40,
    backgroundColor: 'yellow',
    lineHeight: '40px',
    textAlign: 'center',
    color: 'red'
}

const scriptStyle: React.CSSProperties = {
    width: 100,
    height: 40,
    backgroundColor: 'purple',
    lineHeight: '40px',
    textAlign: 'center',
    color: 'red'
}
const HomeHeader: React.FC = (props) => { 
    return (
        <Header style={headerStyle}>
            <LeftOutlined style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)'}}/>
            <Tag style={homeTagStyle}>首页</Tag>
            <Tag style={scriptStyle}>剧本</Tag>
            <Button type="primary">生成脚本</Button>
        </Header>
    )
}

export default HomeHeader