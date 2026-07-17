import { MessageList, Role } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import FileChat from './FileChat'
import { Flex } from 'antd'
import ScriptBtn from './ScriptBtn'
import Style from './index.module.less'
import classNames from 'classnames'
import { memo, useMemo } from 'react'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'
import { normalizeMarkdownSource } from '@/utils'
interface IProps {
  messageInfo: MessageList
  md: any
  onResend: (params: ScriptSocketPayload) => boolean
  highlighted?: boolean
}
const MessageItem = ({ messageInfo, md, onResend, highlighted }: IProps) => {
  const renderedHtml = useMemo(() => {
    return md.render(normalizeMarkdownSource(typeof messageInfo.messageContent === 'string' ? messageInfo.messageContent : ''))
  }, [md, messageInfo.messageContent])
  const showScriptActions = messageInfo.role === Role.Gpt && messageInfo.messageType !== 'interrupted'

  if (!messageInfo.messageContent) return null
  return (
    <HeadLayout messageInfo={messageInfo}>
      <Flex
        vertical={true}
        className={classNames(Style.content, Style['messageInfo-item-cont'], Style[messageInfo.role], {
          [Style.highlighted]: highlighted,
        })}>
        <div
          className={Style['message-content-inner']}
          dangerouslySetInnerHTML={{
            __html: renderedHtml,
          }}></div>
        {messageInfo.role === Role.user && <FileChat messageInfo={messageInfo}></FileChat>}
        {showScriptActions && (
          <ScriptBtn
            messageInfo={messageInfo}
            onResend={onResend}
          />
        )}
      </Flex>
    </HeadLayout>
  )
}

export default memo(MessageItem)
