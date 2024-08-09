import { MessageList } from '@/api/type'
import HeadLayout from '../../../../../components/messageHeadLayout'
import { Spin } from 'antd'
interface IProps {
  messageInfo: MessageList
  containerRef?: any
  md: any
}
export default ({ messageInfo, containerRef, md }: IProps) => {
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
        {messageInfo.requesting ? (
          <div>
            <Spin size='small' />
          </div>
        ) : null}
        <div ref={containerRef} className='typed-text'></div>
      </HeadLayout>
    </div>
  )
}
