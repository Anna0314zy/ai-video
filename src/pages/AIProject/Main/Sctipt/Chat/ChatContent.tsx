import { MessageList } from '@/api/types/script'
import MarkdownIt from 'markdown-it'
import MessageItem from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem'
import GptMessage from '@/pages/AIProject/Main/Sctipt/Chat/components/MessageItem/GptMessage'
import { useMemo, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import InfiniteScroll from 'react-infinite-scroll-component'
import { get } from 'lodash-es'
import { useSize } from 'ahooks'
import { Divider, Skeleton } from 'antd'
const style = {
  color: '#000',
  height: '100%',
  overflow: 'auto',
  padding: '10px',
}
const ChatContent = ({ chatIngText }: any) => {
  let md: MarkdownIt | null = null
  if (!md) md = new MarkdownIt()
  const { messageListMap, currentSessionId } = useSelector((state: RootState) => state.aiScript)
  const dispatch = useDispatch<Dispatch>()
  const lastMessage = useMemo(() => {
    return messageListMap.data?.find(v => v.requesting) || {}
  }, [messageListMap])
  const loadMoreData = async (scroll: boolean, current?: number) => {
    // 如果是滚动 需要计算从哪一页开始请求
    const data = get(messageListMap, `data`, [])
    const size = get(messageListMap, `size`)
    await dispatch.aiScript.getChatHistories({
      scroll,
      current: current ? current : data?.length > 0 ? Math.round(data.length / size) + 1 : 1,
    })
  }
  useEffect(() => {
    loadMoreData(false, 1)
  }, [currentSessionId])
  const wrapper = useRef<HTMLDivElement>(null)
  const size = useSize(wrapper)
  const hasMore = useMemo(() => {
    const total = messageListMap.total
    const messageListLength = (messageListMap.data || []).length
    return total !== null ? messageListLength < total : true
  }, [messageListMap])
  useEffect(() => {
    console.log('%c hasMore', 'color:red;', hasMore, size?.height)
  }, [hasMore, size])
  return (
    <div
      style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F2F3F7', color: '#000000' }}
      className='chat-content'
      ref={wrapper}>
      {size?.height ? (
        <InfiniteScroll
          height={size?.height}
          dataLength={get(messageListMap, `data`, []).length}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          next={() => loadMoreData(true)}
          hasMore={hasMore}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          // scrollableTarget={'scrollableDiv'}
          inverse={true}>
          <GptMessage md={md} messageInfo={lastMessage as MessageList} chatIngText={chatIngText}></GptMessage>
          {get(messageListMap, `data`, []).map(item => {
            return <MessageItem md={md} key={String(item.id)} messageInfo={item}></MessageItem>
          })}
        </InfiniteScroll>
      ) : null}
    </div>
  )
}

export default ChatContent
