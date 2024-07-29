import { Button, Tag, Layout, Col, Row, Flex } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import iconExcel from '@/assets/images/icon_excel.png'
import confirm from '@/assets/images/img_confirm.png'
import './index.modlue.less'

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

            <Flex style={{ height: '100%', width: '100%' }} align='center' justify='space-between'>
                <Flex align='center' >
                    <LeftOutlined style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)' }} />
                    <img style={{ width: 22, marginLeft: 12 }} src={iconExcel} ></img>
                    <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《高尔基的童年》</span>
                    <span className='tip-shu'> | </span>
                    <span className='tip-text'> 剧本设计</span>
                    <img src={confirm} style={{ width: 68, marginLeft: 12}}></img>
                </Flex>
                <Flex align='center'>
                    <Button>跳过</Button>
                    <Button>下一步</Button>
                </Flex>
            </Flex>



        </Header>
    )
}

export default HomeHeader