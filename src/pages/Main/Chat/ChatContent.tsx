import { MessageList } from '@/api/type'
import MarkdownIt from 'markdown-it'
import MessageItem from '@/pages/Main/Chat/components/MessageItem'
import GptMessage from '@/pages/Main/Chat/components/MessageItem/GptMessage'

import { useMemo } from 'react'
const style = {
  color: '#000',
  height: '100%',
  overflow: 'auto',
  padding: '10px',
}
const ChatContent = (props: { containerRef: any; messageList: MessageList[] }) => {
  let md: MarkdownIt | null = null
  if (!md) md = new MarkdownIt()
  const lastMessage = useMemo(() => {
    console.log('zy lastMessage', props.messageList.slice(-1)?.[0])
    return props.messageList.find(v => v.requesting || v.sending) || {}
  }, [props.messageList])
  return (
    <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }} className='chat-content'>
      <div className='message-list' style={style}>
        {props.messageList.map((item: MessageList) => {
          return (
            item.messageContent && (
              <MessageItem md={md} key={item.id} messageInfo={item} containerRef={props.containerRef}></MessageItem>
            )
          )
        })}
        {/* 最后一个聊天的信息 */}
        <GptMessage md={md} messageInfo={lastMessage as MessageList} containerRef={props.containerRef}></GptMessage>
      </div>
    </div>
  )
}

export default ChatContent
