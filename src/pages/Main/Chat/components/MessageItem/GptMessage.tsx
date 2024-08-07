import { MessageList } from '@/api/type'
import HeadLayout from './HeadLayout'
interface IProps {
  messageInfo: MessageList
  containerRef?: any
  md: any
}
export default ({ messageInfo, containerRef, md }: IProps) => {
  return (
    <HeadLayout messageInfo={messageInfo}>
      {messageInfo.messageContent && (
        <div
          style={{ display: messageInfo.sending ? 'none' : 'block' }}
          className='content'
          dangerouslySetInnerHTML={{
            __html: md.render(typeof messageInfo.messageContent === 'string' ? messageInfo.messageContent : ''),
          }}></div>
      )}
      <div ref={containerRef}></div>
    </HeadLayout>
  )
}
