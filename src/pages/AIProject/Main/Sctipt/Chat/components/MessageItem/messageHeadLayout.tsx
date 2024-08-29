import dayjs from 'dayjs'
import { Flex, Image } from 'antd'
import chatGpt from '@/assets/images/chatGpt.png'
import { MessageList, Role } from '@/api/types/script'
import classNames from 'classnames'
import Style from './index.module.less'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const HeadLayout = ({ messageInfo, children }: { messageInfo: MessageList; children: React.ReactNode }) => {
  const myStyle: React.CSSProperties = {
    flexDirection: 'row-reverse',
    justifyContent: ' flex-start',
  }
  const { userInfo } = useSelector((state: RootState) => state.auth)
  return (
    <Flex
      className={classNames(Style['message-item'], Style[messageInfo.role])}
      style={messageInfo.role === Role.user ? myStyle : undefined}
      justify={messageInfo.role === Role.user ? 'flex-start' : 'flex-end'}>
      <div className={classNames(Style.avatar, Style[messageInfo.role])}>
        {messageInfo.role === Role.Gpt ? <Image src={chatGpt} preview={false}></Image> : userInfo?.username.slice(0, 1)}
      </div>
      <Flex className={classNames(Style['message-item-content'], Style[messageInfo.role])} vertical={true} flex={1}>
        <div className={classNames(Style['message-time'], Style[messageInfo.role])}>
          {dayjs(messageInfo.created).format('YYYY-MM-DD HH:mm')}
        </div>
        {children}
      </Flex>
    </Flex>
  )
}
export default HeadLayout
