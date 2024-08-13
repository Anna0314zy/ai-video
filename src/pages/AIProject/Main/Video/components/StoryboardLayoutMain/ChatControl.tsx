import { Button, Flex } from 'antd'
import { useContext, useState } from 'react'
import { MyContext } from '../..'
import AudioChatConfig from './AudioChatConfig'
import VideoChatConfig from './VideoChatConfig'
import ImageChatConfig from './ImageChatConfig'
import ChatInput from '../../../../components/ChatInput'
import * as api from '@/api/models/video'
import CommonUpload from '@/components/CommonUpload'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '10px',
}
const ChatControl = () => {
  const { selectedType, curShot, projectId } = useContext(MyContext)
  const [prompt, setPrompt] = useState<{
    text?: string
    fileId?: number
    fileName?: string
    promptRequestLogId?: number
  }>({
    text: 'imagine Fantasy landscape, a serene lake surrounded by towering mountains, lush green forests, and vibrant wildflowers in full bloom. A majestic castle sits atop one of the mountains, with its spires piercing through fluffy clouds. The sky is painted with hues of pink, orange, and purple from a setting sun, casting a magical glow over the scene. --v 5 --ar 16:9 --q 2 ',
    fileId: 0,
    promptRequestLogId: 0,
  })
  const content = () => {
    if (selectedType === 'pic') {
      return <ImageChatConfig></ImageChatConfig>
    } else if (selectedType === 'video') {
      return <VideoChatConfig />
    } else if (selectedType === 'voice') {
      return <AudioChatConfig />
    }
  }
  const handleUploadSuccess = (val: { fileId: number; fileName: string }) => {
    // handleApply(val)
    setPrompt(prev => {
      return {
        ...prev,
        fileId: val.fileId,
        fileName: val.fileName,
      }
    })
  }
  const handleInputSend = async () => {
    if (!prompt?.text) return
    // handleSendMessage()
    // api
    await api.addText2imageTask({
      text: prompt.text,
      shotId: curShot?.shotId!,
      projectId: projectId!,
    })
  }
  const handleInputChange = (val: string) => {
    console.log('handleInputChange', val)
    setPrompt(prev => {
      return {
        ...prev,
        text: val,
      }
    })
  }
  return (
    <Flex vertical={true} style={style}>
      <Flex align='center'>
        <div>{content()}</div>
        <Button type={'primary'} style={{ marginLeft: '10px' }}>
          应用
        </Button>
      </Flex>
      <ChatInput
        prompt={prompt}
        onChange={handleInputChange}
        onSend={handleInputSend}
        // chatIng={chatIng}
      >
        <CommonUpload>{/* Icon */}</CommonUpload>
      </ChatInput>
    </Flex>
  )
}
export default ChatControl
