import dayjs from 'dayjs'
import './MessafeItem.less'
interface IProps {
  messageInfo: IMessageInfo
}
interface IMessageInfo {
  type: string
  content: string
  time: string
}
export default ({ messageInfo }: IProps) => {
  console.log('file: MessageItem.tsx:11 ~ messageInfo:', messageInfo)
  return (
    <div className={`message-item ${messageInfo.type}`}>
        <div className='left'>
            <div className='message-time'>{dayjs(messageInfo.time).format('YYYY-MM-DD HH:mm')}</div>
            <div className="content">{messageInfo.content}</div>
        </div>
        <div className='right'>
            <div className='avatar'>a</div>
        </div>
    </div>
  )
}
