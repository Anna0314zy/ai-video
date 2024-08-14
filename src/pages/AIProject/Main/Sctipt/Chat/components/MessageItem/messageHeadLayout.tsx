import dayjs from 'dayjs'
import { Flex, Image } from 'antd'
import chatGpt from '@/assets/images/chatGpt.png'
import { MessageList, Role } from '@/api/types/script'
import classNames from 'classnames'

const HeadLayout = ({ messageInfo, children }: { messageInfo: MessageList; children: React.ReactNode }) => {
  const myStyle: React.CSSProperties = {
    flexDirection: 'row-reverse',
    justifyContent: ' flex-start',
  }
  return (
    <Flex
      className={classNames('message-item', messageInfo.role)}
      style={messageInfo.role === Role.user ? myStyle : undefined}
      justify={messageInfo.role === Role.user ? 'flex-start' : 'flex-end'}>
      <div className={`avatar ${messageInfo.role}`}>
        {messageInfo.role === Role.Gpt ? <Image src={chatGpt} preview={false}></Image> : '我'}
      </div>
      <Flex className={`message-item-content ${messageInfo.role}`} vertical={true} flex={1}>
        <div className={`message-time ${messageInfo.role}`}>
          {dayjs(messageInfo.created).format('YYYY-MM-DD HH:mm')}
        </div>
        {children}
      </Flex>
    </Flex>
  )
}
export default HeadLayout
