import { MessageList, Role } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import FileChat from './FileChat'
import { Flex } from 'antd'
import ScriptBtn from './ScriptBtn'
import Style from './index.module.less'
import classNames from 'classnames'
interface IProps {
  messageInfo: MessageList
  md: any
}
export default ({ messageInfo, md }: IProps) => {
  if (!messageInfo.messageContent) return
  return (
    <HeadLayout messageInfo={messageInfo}>
      <Flex
        vertical={true}
        className={classNames(Style.content, Style['messageInfo-item-cont'], Style[messageInfo.role])}>
        <div
          className={Style['message-content-inner']}
          dangerouslySetInnerHTML={{
            __html: md.render(typeof messageInfo.messageContent === 'string' ? messageInfo.messageContent : ''),
          }}></div>
        {messageInfo.role === Role.user && <FileChat messageInfo={messageInfo}></FileChat>}
        {messageInfo.role === Role.Gpt && <ScriptBtn messageInfo={messageInfo} />}
      </Flex>
    </HeadLayout>
  )
}
