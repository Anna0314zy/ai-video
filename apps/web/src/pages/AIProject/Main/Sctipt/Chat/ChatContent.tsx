import { MessageList, Role } from '@/api/types/script'
import MarkdownIt from 'markdown-it'
import MessageItem from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem'
import GptMessage from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem/GptMessage'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { get } from 'lodash-es'
import { useSize } from 'ahooks'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso'

interface ChatContentProps {
  chatIngText: string
  streamScrollKey: number
  onResend: (params: ScriptSocketPayload) => boolean
  onContinue: (params: ScriptSocketPayload) => boolean
}

const CHAT_HISTORY_PAGE_SIZE = 15
const ESTIMATED_MESSAGE_HEIGHT = 120
const LOAD_OLDER_OVERSCAN_COUNT = 2

const VirtuosoItem = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      ...props.style,
      width: '100%',
      paddingRight: 10,
      paddingLeft: 10,
    }}
  />
)

const ChatContent = ({ chatIngText, streamScrollKey, onResend, onContinue }: ChatContentProps) => {
  const md = useMemo(() => new MarkdownIt(), [])
  const { messageListMap, currentSessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
  const dispatch = useDispatch<Dispatch>()
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const isAtBottomRef = useRef(true)
  const autoFollowRef = useRef(false)
  const loadingRef = useRef(false)
  const followFrameRef = useRef<number | null>(null)
  const initialScrolledSessionRef = useRef<number | null>(null)
  const userScrollIntentRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)
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
  const firstLoadedIndex = Math.max(0, estimatedTotalCount - displayMessages.length)
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
      userScrollIntentRef.current = false
    }
  }, [dispatch, hasMore])
  const loadOlderMessages = useCallback(() => {
    if (loadingRef.current) return
    if (!userScrollIntentRef.current) return
    if (isAtBottomRef.current) return
    loadMoreData(true)
  }, [loadMoreData])
  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      if (!hasMore) return
      if (range.startIndex > firstLoadedIndex + LOAD_OLDER_OVERSCAN_COUNT) return
      loadOlderMessages()
    },
    [firstLoadedIndex, hasMore, loadOlderMessages],
  )
  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    virtuosoRef.current?.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior,
    })
    virtuosoRef.current?.autoscrollToBottom()
  }, [])
  const scrollToLatestMessage = useCallback(
    (behavior: 'auto' | 'smooth' = 'auto') => {
      if (!displayMessages.length) return

      const scroll = () => scrollToBottom(behavior)

      scroll()
      requestAnimationFrame(scroll)
      requestAnimationFrame(() => requestAnimationFrame(scroll))
      window.setTimeout(scroll, 80)
    },
    [displayMessages.length, scrollToBottom],
  )
  const autoscrollToBottomOnce = useCallback(() => {
    if (followFrameRef.current) return
    followFrameRef.current = requestAnimationFrame(() => {
      followFrameRef.current = null
      virtuosoRef.current?.autoscrollToBottom()
    })
  }, [])
  useEffect(() => {
    if (currentSessionId) loadMoreData(false)
  }, [currentSessionId])
  useEffect(() => {
    if (!currentSessionId || !displayMessages.length || chatIng) return
    if (initialScrolledSessionRef.current === currentSessionId) return
    initialScrolledSessionRef.current = currentSessionId
    scrollToLatestMessage('auto')
  }, [currentSessionId, displayMessages.length, chatIng, scrollToLatestMessage])
  useEffect(() => {
    if (!streamScrollKey || !streamingMessage) return
    autoFollowRef.current = true
    scrollToLatestMessage('auto')
  }, [streamScrollKey, streamingMessage, scrollToLatestMessage])
  useEffect(() => {
    if (!displayMessages.length || (!isAtBottomRef.current && !autoFollowRef.current)) return
    if (chatIngText || autoFollowRef.current) {
      autoscrollToBottomOnce()
    }
  }, [chatIngText, displayMessages.length, autoscrollToBottomOnce])
  useEffect(() => {
    if (!chatIng) autoFollowRef.current = false
  }, [chatIng])
  useEffect(() => {
    return () => {
      if (followFrameRef.current) cancelAnimationFrame(followFrameRef.current)
    }
  }, [])
  const wrapper = useRef<HTMLDivElement>(null)
  const size = useSize(wrapper)
  return (
    <div
      style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }}
      className='script-chat-content'
      onWheel={event => {
        userScrollIntentRef.current = event.deltaY < 0
      }}
      onTouchStart={event => {
        touchStartYRef.current = event.touches[0]?.clientY ?? null
      }}
      onTouchMove={event => {
        const currentY = event.touches[0]?.clientY
        if (touchStartYRef.current === null || currentY === undefined) return
        const deltaY = currentY - touchStartYRef.current
        touchStartYRef.current = currentY
        userScrollIntentRef.current = deltaY > 0
      }}
      ref={wrapper}>
      {size?.height ? (
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: size.height }}
          totalCount={estimatedTotalCount}
          defaultItemHeight={ESTIMATED_MESSAGE_HEIGHT}
          initialTopMostItemIndex={
            estimatedTotalCount > 0
              ? {
                  index: estimatedTotalCount - 1,
                  align: 'end',
                }
              : undefined
          }
          increaseViewportBy={{ top: 600, bottom: 200 }}
          startReached={loadOlderMessages}
          atTopStateChange={atTop => {
            if (atTop) loadOlderMessages()
          }}
          rangeChanged={handleRangeChanged}
          followOutput={isAtBottom => (autoFollowRef.current || isAtBottom ? 'auto' : false)}
          atBottomStateChange={atBottom => {
            isAtBottomRef.current = atBottom
            if (!chatIng) return
            autoFollowRef.current = atBottom
          }}
          components={{
            Item: VirtuosoItem,
          }}
          itemContent={index => {
            const item = displayMessages[index - firstLoadedIndex]
            if (!item) return <div style={{ height: ESTIMATED_MESSAGE_HEIGHT }} />
            if (item.requesting) return <GptMessage md={md} messageInfo={item} chatIngText={chatIngText} />
            return (
              <MessageItem
                md={md}
                key={String(item.id)}
                messageInfo={item}
                onResend={onResend}
                onContinue={onContinue}
              />
            )
          }}
        />
      ) : null}
    </div>
  )
}

export default ChatContent
