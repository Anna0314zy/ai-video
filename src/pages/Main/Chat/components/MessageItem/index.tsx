import { MessageList } from '@/api/type'
import HeadLayout from './HeadLayout'
import './index.less'
interface IProps {
  messageInfo: MessageList
  md: any
  containerRef?: any
}
export default ({ messageInfo, md, containerRef }: IProps) => {
  return (
    <HeadLayout messageInfo={messageInfo}>
      <div className='content' dangerouslySetInnerHTML={{ __html: md.render(messageInfo.messageContent) }}></div>
    </HeadLayout>
  )
}
