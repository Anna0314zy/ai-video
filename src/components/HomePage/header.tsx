import { Button, Tag, Layout, Col, Row, Flex } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import confirm from '@/assets/images/img_confirm.png'
import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget';


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

const HomeHeader: React.FC = (props) => {
    return (
        <Header style={headerStyle} className={Styles['home-header']}>
            <Flex style={{ height: '100%', width: '100%' }} align='center' justify='space-between'>
                <Flex align='center' >
                    <LeftOutlined style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)' }} />
                    <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }}/>
                    <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《高尔基的童年》</span>
                    <span className={Styles['tip-shu']}> | </span>
                    <span className={Styles['tip-text']}> 剧本设计</span>
                    <img src={confirm} style={{ width: 68, marginLeft: 12}}></img>
                </Flex>
                <Flex align='center' gap="small">
                    <Button>跳过</Button>
                    <Button>下一步</Button>
                </Flex>
            </Flex>
        </Header>
    )
}

export default HomeHeader