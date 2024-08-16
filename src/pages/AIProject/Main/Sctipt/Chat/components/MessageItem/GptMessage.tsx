import { MessageList } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import { Spin } from 'antd'
interface IProps {
  messageInfo: MessageList
  containerRef?: any
  md: any
  typeRef?: any
  chatIngText?: string
  chatIng?: boolean
}
export default ({ messageInfo, md, containerRef, chatIngText, chatIng }: IProps) => {
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
          ref={containerRef}
          style={{ display: !chatIng ? 'none' : 'block' }}
          dangerouslySetInnerHTML={{
            __html: md.render(chatIngText || ''),
          }}></div>
      </HeadLayout>
    </div>
  )
}
