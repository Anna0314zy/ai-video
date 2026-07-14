import { Flex, Image } from 'antd'
import chatGpt from '@/assets/images/chatGpt.png'
import dayjs from 'dayjs'
import { ChatMessageList } from '@/api/types/video'

const wrapperStyle: React.CSSProperties = {
  padding: '10px',
}
const MessageLayout = ({ children, data }: { children: React.ReactNode; data: ChatMessageList }) => {
  return (
    <div>
      <Flex justify={'flex-start'} style={wrapperStyle}>
        <Image src={chatGpt} preview={false}></Image>
        <Flex vertical={true} flex={1} style={{ paddingLeft: '10px' }}>
          <div>{data.created}</div>
          {children}
        </Flex>
      </Flex>
    </div>
  )
}
export default MessageLayout
