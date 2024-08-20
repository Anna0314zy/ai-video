import { MessageList } from '@/api/types/script'
import MarkdownIt from 'markdown-it'
import MessageItem from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem'
import GptMessage from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem/GptMessage'
import { useMemo, useEffect, useRef } from 'react'
import { PAGE_SIZE } from '@/api/types/script'
import { usePrevious } from 'ahooks'
import { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { isEqual } from 'lodash-es'
import { MyContext } from '../MyContext'
const style = {
  color: '#000',
  height: '100%',
  overflow: 'auto',
  padding: '10px',
}
const ChatContent = (props: { messageList: MessageList[]; chatIngText: any; chatIng: boolean; sessionId?: number }) => {
  let md: MarkdownIt | null = null
  if (!md) md = new MarkdownIt()
  const dispatch = useDispatch<Dispatch>()
  const { contentMessagesRef, handleScrollBottom } = useContext(MyContext)
  const lastMessage = useMemo(() => {
    return props.messageList.find(v => v.requesting || v.sending) || {}
  }, [props.messageList])
  // const contentMessagesRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const init = async () => {
    await dispatch.aiScript.getChatHistories({ current: 1, size: PAGE_SIZE })
    setTimeout(() => {
      handleScrollBottom()
    }, 100)
  }
  useEffect(() => {
    init()
  }, [props.sessionId])
  return (
    <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }} className='chat-content'>
      <div className='message-list' style={style} ref={contentMessagesRef} id='scriptChat'>
        {props.messageList.map((item: MessageList) => {
          return (
            item.messageContent && (
              <MessageItem md={md} key={String(item.id) + '_' + String(item.scriptId)} messageInfo={item}></MessageItem>
            )
          )
        })}
        {/* 最后一个聊天的信息 */}
        <GptMessage
          chatIngText={props.chatIngText}
          lastMessageRef={lastMessageRef}
          md={md}
          chatIng={props.chatIng}
          messageInfo={lastMessage as MessageList}></GptMessage>
      </div>
    </div>
  )
}

export default ChatContent
