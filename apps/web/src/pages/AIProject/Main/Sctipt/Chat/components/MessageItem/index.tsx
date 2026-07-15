import { MessageList, Role } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import FileChat from './FileChat'
import { Flex } from 'antd'
import ScriptBtn from './ScriptBtn'
import Style from './index.module.less'
import classNames from 'classnames'
import { memo, useMemo } from 'react'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'
interface IProps {
  messageInfo: MessageList
  md: any
  onResend: (params: ScriptSocketPayload) => boolean
  onContinue: (params: ScriptSocketPayload) => boolean
}
const MessageItem = ({ messageInfo, md, onResend, onContinue }: IProps) => {
  const renderedHtml = useMemo(() => {
    return md.render(typeof messageInfo.messageContent === 'string' ? messageInfo.messageContent : '')
  }, [md, messageInfo.messageContent])

  if (!messageInfo.messageContent) return null
  return (
    <HeadLayout messageInfo={messageInfo}>
      <Flex
        vertical={true}
        className={classNames(Style.content, Style['messageInfo-item-cont'], Style[messageInfo.role])}>
        <div
          className={Style['message-content-inner']}
          dangerouslySetInnerHTML={{
            __html: renderedHtml,
          }}></div>
        {messageInfo.role === Role.user && <FileChat messageInfo={messageInfo}></FileChat>}
        {messageInfo.role === Role.Gpt && (
          <ScriptBtn
            messageInfo={messageInfo}
            onResend={onResend}
            onContinue={onContinue}
          />
        )}
      </Flex>
    </HeadLayout>
  )
}

export default memo(MessageItem)
