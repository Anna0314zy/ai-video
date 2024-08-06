import { MessageList } from '@/api/type'
import HeadLayout from './HeadLayout'
interface IProps {
  messageInfo: MessageList
  containerRef?: any
}
export default ({ messageInfo, containerRef }: IProps) => {
  return (
    <HeadLayout messageInfo={messageInfo}>
      <div ref={containerRef}></div>
    </HeadLayout>
  )
}
