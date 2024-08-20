import { Flex } from 'antd'
import ChatContent from './ChatContent'
import ChatControl from './ChatControl'
const contentStyle: React.CSSProperties = {
  height: '100%',
  color: '#fff',
  backgroundColor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}
export default () => {
  return (
    <Flex vertical={true} style={contentStyle} flex={1}>
      <ChatContent />
      <ChatControl />
    </Flex>
  )
}
