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
    return props.messageList.slice(-1)?.[0]
  }, [props.messageList])
  return (
    <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }} className='chat-content'>
      <div className='message-list' style={style}>
        {props.messageList.slice(0, props.messageList.length - 1).map((item: MessageList) => {
          return <MessageItem md={md} key={item.id} messageInfo={item} containerRef={props.containerRef}></MessageItem>
        })}
        {lastMessage ? (
          <GptMessage md={md} messageInfo={lastMessage} containerRef={props.containerRef}></GptMessage>
        ) : null}
      </div>
    </div>
  )
}

export default ChatContent
