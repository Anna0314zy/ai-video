import { MessageList, Role } from '@/api/types/script'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import MessageItem from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem'
import GptMessage from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem/GptMessage'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { get } from 'lodash-es'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'
import ChatHistoryList from '@/pages/AIProject/components/ChatHistoryList'

interface ChatContentProps {
  chatIngText: string
  streamScrollKey: number
  onResend: (params: ScriptSocketPayload) => boolean
}

const CHAT_HISTORY_PAGE_SIZE = 15

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const createMarkdownRenderer = () => {
  return new MarkdownIt({
    linkify: true,
    breaks: true,
    highlight(code, language) {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, {
            language,
            ignoreIllegals: true,
          }).value
          return `<pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>`
        } catch {
          return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`
        }
      }

      return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`
    },
  })
}

const ChatContent = ({ chatIngText, streamScrollKey, onResend }: ChatContentProps) => {
  const md = useMemo(() => createMarkdownRenderer(), [])
  const { messageListMap, currentSessionId, chatIng, highlightedMessageId } = useSelector((state: RootState) => state.aiScript)
  const dispatch = useDispatch<Dispatch>()
  const loadingRef = useRef(false)
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
  const displayMessages = useMemo(() => {
    const data = get(messageListMap, `data`, []) as MessageList[]
    return streamingMessage ? [...data, streamingMessage] : data
  }, [messageListMap, streamingMessage])
  const estimatedTotalCount = useMemo(() => {
    const messageTotal = messageListMap.total ?? (messageListMap.data || []).length
    return Math.max(messageTotal + (streamingMessage ? 1 : 0), displayMessages.length)
  }, [displayMessages.length, messageListMap, streamingMessage])
  const hasMore = useMemo(() => {
    const total = messageListMap.total
    const messageListLength = (messageListMap.data || []).length
    return total !== null ? messageListLength < total : true
  }, [messageListMap])
  const loadMoreData = useCallback(async (scroll: boolean) => {
    if (loadingRef.current) return
    if (scroll && !hasMore) return
    loadingRef.current = true
    try {
      await dispatch.aiScript.getChatHistories({
        scroll,
        current: 1,
        size: CHAT_HISTORY_PAGE_SIZE,
      })
    } finally {
      loadingRef.current = false
    }
  }, [dispatch, hasMore])
  useEffect(() => {
    if (currentSessionId) loadMoreData(false)
  }, [currentSessionId])
  return (
    <ChatHistoryList
      items={displayMessages}
      total={estimatedTotalCount}
      hasMore={hasMore}
      onLoadMore={() => loadMoreData(true)}
      listKey={currentSessionId}
      scrollToBottomKey={streamScrollKey ? `${streamScrollKey}-${chatIngText.length}` : undefined}
      highlightedItemId={highlightedMessageId}
      getItemId={item => item.id}
      getItemKey={item => String(item.id)}
      className='script-chat-content'
      style={{ backgroundColor: '#F2F3F7', color: '#000000' }}
      renderItem={item => {
        if (item.requesting) return <GptMessage md={md} messageInfo={item} chatIngText={chatIngText} />
        return (
          <MessageItem
            md={md}
            key={String(item.id)}
            messageInfo={item}
            onResend={onResend}
            highlighted={String(item.id) === String(highlightedMessageId)}
          />
        )
      }}
    />
  )
}

export default ChatContent
