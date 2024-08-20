import { MessageList } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import { Spin } from 'antd'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
interface IProps {
  messageInfo: MessageList
  md: any
  typeRef?: any
  chatIngText?: string
  chatIng?: boolean
  lastMessageRef: React.RefObject<HTMLDivElement>
}
export default ({ messageInfo, md, chatIngText, chatIng, lastMessageRef }: IProps) => {
  const messageList = useSelector((state: RootState) => state.aiScript.messageList)
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageList])
  return (
    <div style={{ display: messageInfo?.requesting || messageInfo?.sending ? 'block' : 'none' }} className='answering'>
      <HeadLayout messageInfo={messageInfo || {}}>
        {messageInfo.messageContent ? (
          <div
            style={{ display: messageInfo?.sending ? 'none' : 'block' }}
            className='content'
            dangerouslySetInnerHTML={{
              __html: md.render(typeof messageInfo?.messageContent === 'string' ? messageInfo.messageContent : ''),
            }}></div>
        ) : null}
        {!chatIngText ? (
          <div>
            <Spin size='small' />
          </div>
        ) : null}
        <div
          ref={lastMessageRef}
          style={{ display: !chatIng ? 'none' : 'block' }}
          dangerouslySetInnerHTML={{
            __html: md.render(chatIngText || ''),
          }}></div>
      </HeadLayout>
    </div>
  )
}
