import { Button, Tag, Layout } from 'antd';
const { Header } = Layout;
const headerStyle: React.CSSProperties = {
    color: '#fff',
    height: 64,
    paddingInline: 48,
    lineHeight: '64px',
    backgroundColor: 'rgba(255,255,255,0)',
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
            <Tag style={homeTagStyle}>首页</Tag>
            <Tag style={scriptStyle}>剧本</Tag>
            <Button type="primary">生成脚本</Button>
        </Header>
    )
}

export default HomeHeader