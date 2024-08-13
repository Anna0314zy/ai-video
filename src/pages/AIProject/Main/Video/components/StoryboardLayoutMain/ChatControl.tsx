import { Layout } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect } from 'react'
import { MyContext } from '../..'
import AudioChatConfig from './AudioChatConfig'
import VideoChatConfig from './VideoChatConfig'
import ImageChatConfig from './ImageChatConfig'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
}
const ChatControl = () => {
  return (
    <div style={style}>
      <AudioChatConfig></AudioChatConfig>
      <VideoChatConfig />
      <ImageChatConfig />
    </div>
  )
}
export default ChatControl
