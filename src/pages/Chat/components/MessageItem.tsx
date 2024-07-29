import dayjs from 'dayjs'
import './MessafeItem.less'
import MarkdownIt from 'markdown-it'
interface IProps {
  messageInfo: IMessageInfo
}
interface IMessageInfo {
  type: string
  content: string
  time: string
}
export default ({ messageInfo }: IProps) => {
  const md = new MarkdownIt()
  return (
    <div className={`message-item ${messageInfo.type}`}>
        <div className='left'>
            <div className='message-time'>{dayjs(messageInfo.time).format('YYYY-MM-DD HH:mm')}</div>
            <div className="content" dangerouslySetInnerHTML={{__html: md.render(messageInfo.content)}}></div>
        </div>
        <div className='right'>
            <div className='avatar'>a</div>
        </div>
    </div>
  )
}
