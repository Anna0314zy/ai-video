import { Flex, Image } from 'antd'
import chatGpt from '@/assets/images/chatGpt.png'
import dayjs from 'dayjs'
const wrapperStyle: React.CSSProperties = {
  padding: '10px',
}
const MessageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Flex justify={'flex-start'} style={wrapperStyle}>
        <Image src={chatGpt} preview={false}></Image>
        <Flex vertical={true} flex={1} style={{ paddingLeft: '10px' }}>
          <div>{dayjs().format('YYYY-MM-DD HH:mm')}</div>
          {children}
        </Flex>
      </Flex>
    </div>
  )
}
export default MessageLayout
