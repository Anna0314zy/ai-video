import { Button, Flex } from 'antd'
import { useContext, useEffect } from 'react'
import { MyContext } from '../..'
import AudioChatConfig from './AudioChatConfig'
import VideoChatConfig from './VideoChatConfig'
import ImageChatConfig from './ImageChatConfig'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '10px',
}
const ChatControl = () => {
  const { selectedType } = useContext(MyContext)
  const content = () => {
    if (selectedType === 'pic') {
      return <ImageChatConfig></ImageChatConfig>
    } else if (selectedType === 'video') {
      return <VideoChatConfig />
    } else if (selectedType === 'voice') {
      return <AudioChatConfig />
    }
  }
  return (
    <Flex style={style} align='center'>
      <div>{content()}</div>
      <Button type={'primary'} style={{ marginLeft: '10px' }}>
        发送
      </Button>
    </Flex>
  )
}
export default ChatControl
