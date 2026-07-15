import { MessageList, Role } from '@/api/types/script'
import MarkdownIt from 'markdown-it'
import MessageItem from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem'
import GptMessage from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem/GptMessage'
import { useMemo, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import InfiniteScroll from 'react-infinite-scroll-component'
import { get } from 'lodash-es'
import { useSize } from 'ahooks'
import { Divider, Skeleton } from 'antd'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'

interface ChatContentProps {
  chatIngText: string
  onResend: (params: ScriptSocketPayload) => boolean
  onContinue: (params: ScriptSocketPayload) => boolean
}

const ChatContent = ({ chatIngText, onResend, onContinue }: ChatContentProps) => {
  const md = useMemo(() => new MarkdownIt(), [])
  const { messageListMap, currentSessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
  const dispatch = useDispatch<Dispatch>()
  const [loading, setLoading] = useState(false)
  const streamingMessage = useMemo<MessageList | null>(() => {
    if (!chatIng || !currentSessionId) return null
    return {
      requesting: true,
      created: Date.now(),
      role: Role.Gpt,
      id: `streaming-${currentSessionId}`,
      sessionId: currentSessionId,
    }
  }, [chatIng, currentSessionId])
  const loadMoreData = async (scroll: boolean) => {
    if (loading) return
    // setLoading(true)
    // 如果是滚动 需要计算从哪一页开始请求
    try {
      const data = get(messageListMap, `data`, [])
      const size = get(messageListMap, `size`)
      await dispatch.aiScript.getChatHistories({
        scroll,
        current: scroll ? Math.floor(data.length / size) + 1 : 1,
      })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (currentSessionId) loadMoreData(false)
  }, [currentSessionId])
  const wrapper = useRef<HTMLDivElement>(null)
  const size = useSize(wrapper)
  const hasMore = useMemo(() => {
    const total = messageListMap.total
    const messageListLength = (messageListMap.data || []).length
    return total !== null ? messageListLength < total : true
  }, [messageListMap])
  return (
    <div
      style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }}
      className='script-chat-content'
      ref={wrapper}>
      {size?.height ? (
        <InfiniteScroll
          height={size?.height}
          dataLength={get(messageListMap, `data`, []).length}
          style={{ display: 'flex', flexDirection: 'column' }}
          next={() => loadMoreData(true)}
          hasMore={hasMore}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          // scrollableTarget={'scrollableDiv'}
          inverse={false}>
          {get(messageListMap, `data`, []).map(item => {
            return (
              <MessageItem
                md={md}
                key={String(item.id)}
                messageInfo={item}
                onResend={onResend}
                onContinue={onContinue}
              />
            )
          })}
          {streamingMessage ? <GptMessage messageInfo={streamingMessage} chatIngText={chatIngText} /> : null}
        </InfiniteScroll>
      ) : null}
    </div>
  )
}

export default ChatContent
