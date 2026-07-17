import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSize } from 'ahooks'
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso'

interface ChatHistoryListProps<T> {
  items: T[]
  total?: number | null
  hasMore: boolean
  onLoadMore: () => Promise<void> | void
  renderItem: (item: T, index: number) => ReactNode
  getItemKey: (item: T, index: number) => string | number
  className?: string
  style?: CSSProperties
  listKey?: string | number
  scrollToBottomKey?: string | number
  highlightedItemId?: string | number
  getItemId?: (item: T) => string | number | undefined
  defaultItemHeight?: number
  loadOlderOverscanCount?: number
  itemHorizontalPadding?: number
}

const DEFAULT_MESSAGE_HEIGHT = 120
const DEFAULT_LOAD_OLDER_OVERSCAN_COUNT = 2

const createVirtuosoItem = (horizontalPadding: number) => {
  return function VirtuosoItem(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div
        {...props}
        style={{
          ...props.style,
          width: '100%',
          paddingRight: horizontalPadding,
          paddingLeft: horizontalPadding,
        }}
      />
    )
  }
}

const ChatHistoryList = <T,>({
  items,
  total,
  hasMore,
  onLoadMore,
  renderItem,
  getItemKey,
  className,
  style,
  listKey,
  scrollToBottomKey,
  highlightedItemId,
  getItemId,
  defaultItemHeight = DEFAULT_MESSAGE_HEIGHT,
  loadOlderOverscanCount = DEFAULT_LOAD_OLDER_OVERSCAN_COUNT,
  itemHorizontalPadding = 10,
}: ChatHistoryListProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const size = useSize(wrapperRef)
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const isAtBottomRef = useRef(true)
  const autoFollowRef = useRef(false)
  const loadingRef = useRef(false)
  const followFrameRef = useRef<number | null>(null)
  const initialScrolledListRef = useRef<string | number | null>(null)
  const userScrollIntentRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)

  const estimatedTotalCount = Math.max(total ?? items.length, items.length)
  const firstLoadedIndex = Math.max(0, estimatedTotalCount - items.length)
  const Item = useMemo(() => createVirtuosoItem(itemHorizontalPadding), [itemHorizontalPadding])

  const loadOlderMessages = useCallback(async () => {
    if (loadingRef.current) return
    if (!hasMore) return
    if (!userScrollIntentRef.current) return
    if (isAtBottomRef.current) return
    loadingRef.current = true
    try {
      await onLoadMore()
    } finally {
      loadingRef.current = false
      userScrollIntentRef.current = false
    }
  }, [hasMore, onLoadMore])

  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      if (!hasMore) return
      if (range.startIndex > firstLoadedIndex + loadOlderOverscanCount) return
      loadOlderMessages()
    },
    [firstLoadedIndex, hasMore, loadOlderMessages, loadOlderOverscanCount],
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
      if (!items.length) return

      const scroll = () => scrollToBottom(behavior)

      scroll()
      requestAnimationFrame(scroll)
      requestAnimationFrame(() => requestAnimationFrame(scroll))
      window.setTimeout(scroll, 80)
    },
    [items.length, scrollToBottom],
  )

  const autoscrollToBottomOnce = useCallback(() => {
    if (followFrameRef.current) return
    followFrameRef.current = requestAnimationFrame(() => {
      followFrameRef.current = null
      virtuosoRef.current?.autoscrollToBottom()
    })
  }, [])

  useEffect(() => {
    if (!listKey || !items.length) return
    if (initialScrolledListRef.current === listKey) return
    initialScrolledListRef.current = listKey
    scrollToLatestMessage('auto')
  }, [items.length, listKey, scrollToLatestMessage])

  useEffect(() => {
    if (!scrollToBottomKey) return
    autoFollowRef.current = true
    scrollToLatestMessage('auto')
  }, [scrollToBottomKey, scrollToLatestMessage])

  useEffect(() => {
    if (!items.length || (!isAtBottomRef.current && !autoFollowRef.current)) return
    if (autoFollowRef.current) autoscrollToBottomOnce()
  }, [autoscrollToBottomOnce, items.length])

  useEffect(() => {
    if (!highlightedItemId || !getItemId) return
    const targetIndex = items.findIndex(item => String(getItemId(item)) === String(highlightedItemId))
    if (targetIndex < 0) return
    virtuosoRef.current?.scrollToIndex({
      index: firstLoadedIndex + targetIndex,
      align: 'center',
      behavior: 'smooth',
    })
  }, [firstLoadedIndex, getItemId, highlightedItemId, items])

  useEffect(() => {
    return () => {
      if (followFrameRef.current) cancelAnimationFrame(followFrameRef.current)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ flex: 1, overflow: 'hidden', ...style }}
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
      }}>
      {size?.height ? (
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: size.height }}
          totalCount={estimatedTotalCount}
          defaultItemHeight={defaultItemHeight}
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
          computeItemKey={index => {
            const itemIndex = index - firstLoadedIndex
            const item = items[itemIndex]
            return item ? getItemKey(item, itemIndex) : `placeholder-${index}`
          }}
          atTopStateChange={atTop => {
            if (atTop) loadOlderMessages()
          }}
          rangeChanged={handleRangeChanged}
          followOutput={isAtBottom => (autoFollowRef.current || isAtBottom ? 'auto' : false)}
          atBottomStateChange={atBottom => {
            isAtBottomRef.current = atBottom
            autoFollowRef.current = atBottom
          }}
          components={{
            Item,
          }}
          itemContent={index => {
            const itemIndex = index - firstLoadedIndex
            const item = items[itemIndex]
            if (!item) return <div style={{ height: defaultItemHeight }} />
            return renderItem(item, itemIndex)
          }}
        />
      ) : null}
    </div>
  )
}

export default ChatHistoryList
