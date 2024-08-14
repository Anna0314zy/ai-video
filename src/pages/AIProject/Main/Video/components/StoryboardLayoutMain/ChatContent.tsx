import { Layout } from 'antd'
import ImageContent from './ImageContent'
const style: React.CSSProperties = {
  backgroundColor: '#F2F3F7',
}
const ChatContent = () => {
  return (
    <Layout.Content style={style}>
      <ImageContent></ImageContent>
    </Layout.Content>
  )
}
export default ChatContent
