import { MessageList, Role } from '@/api/type'
import HeadLayout from './HeadLayout'
import FileChat from './FileChat'
import { Flex } from 'antd'
import ScriptBtn from './ActionBtn/ScriptBtn'
import './index.less'
interface IProps {
  messageInfo: MessageList
  md: any
  containerRef?: any
}
export default ({ messageInfo, md }: IProps) => {
  return (
    <HeadLayout messageInfo={messageInfo}>
      <Flex vertical={true} className='content'>
        <div
          dangerouslySetInnerHTML={{
            __html: md.render(typeof messageInfo.messageContent === 'string' ? messageInfo.messageContent : ''),
          }}></div>
        <FileChat messageInfo={messageInfo}></FileChat>
        {messageInfo.role === Role.Gpt && <ScriptBtn messageInfo={messageInfo} />}
      </Flex>
    </HeadLayout>
  )
}
