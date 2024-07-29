import { Input } from 'antd';
import { LinkOutlined, SendOutlined } from '@ant-design/icons'


export default () => {
    return (
        <Input size="large" placeholder="给我发送消息吧" prefix={<LinkOutlined />} suffix={<SendOutlined />}/>
    )
}