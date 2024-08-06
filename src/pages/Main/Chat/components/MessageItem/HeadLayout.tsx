import dayjs from 'dayjs'
import { Flex, Image } from 'antd'
import chatGpt from './chatGpt.png'
import { MessageList } from '@/api/type'
import classNames from 'classnames'

const HeadLayout = ({ messageInfo, children }: { messageInfo: MessageList; children: React.ReactNode }) => {
  const myStyle: React.CSSProperties = {
    flexDirection: 'row-reverse',
    justifyContent: ' flex-start',
  }
  return (
    <Flex
      className={classNames('message-item', messageInfo.messageRole)}
      style={messageInfo.messageRole === 'user' ? myStyle : undefined}
      justify={messageInfo.messageRole === 'user' ? 'flex-start' : 'flex-end'}>
      <div className={`avatar ${messageInfo.messageRole}`}>
        {messageInfo.messageRole === 'gpt' ? <Image src={chatGpt} preview={false}></Image> : '我'}
      </div>
      <Flex className={`message-item-content`} vertical={true} flex={1}>
        <div className='message-time'>{dayjs(messageInfo.createTime).format('YYYY-MM-DD HH:mm')}</div>
        {children}
      </Flex>
    </Flex>
  )
}
export default HeadLayout
