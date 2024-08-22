import { Layout } from 'antd'
import { Flex } from 'antd'
import { useEffect, useState, useRef, useMemo } from 'react'
import { ChatMessageList, EnumUploadType, Text2imageMessageOptions } from '@/api/types/video'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
import MaterialContent from './MaterialContent'
import MaterialState from './MaterialState'
import ContentActionBtn from './ContentActionBtn'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Divider, Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import { useSize } from 'ahooks'
import { get } from 'lodash-es'
const ChatContent = () => {
  const dispatch = useDispatch<Dispatch>()
  const { currentSelectType, currentShotId, messageListMap, containerRef } = useSelector(
    (state: RootState) => state.aiVideo,
  )
  const projectId = Number(useParams().id)
  const [loading, setLoading] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>({})
  const [current, setCurrent] = useState(1)
  useEffect(() => {
    setCurrent(1)
  }, [currentSelectType])
  const [total, setTotal] = useState<number | null>(null)
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.taskId]: {
        [option.custom]: true,
      },
    }))
    try {
      await dispatch.aiVideo.addChatTask({
        data: {
          shotId: currentShotId,
          option: option.custom,
          projectId,
          requestLogId: item.historyId,
        },
        type: EnumUploadType['IMAGE'],
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [item.taskId]: {
          [option.custom]: false,
        },
      }))
    }
  }
  const loadMoreData = async (scroll: boolean, current?: number) => {
    // 如果是滚动 需要计算从哪一页开始请求
    const data = get(messageListMap, `${currentSelectType}.${currentShotId}.data`, [])
    const size = get(messageListMap, `${currentSelectType}.${currentShotId}.size`)
    await dispatch.aiVideo.getMessageList({
      type: currentSelectType,
      shotId: currentShotId,
      scroll,
      current: current ? current : data?.length > 0 ? Math.round(data.length / size) + 1 : 1,
    })
  }
  useEffect(() => {
    if (currentShotId && currentSelectType) {
      // 如果之前有数据 就不请求了
      if (get(messageListMap, `${currentSelectType}.${currentShotId}.data`)) return
      // 否则请求数据
      loadMoreData(false, 1)
    }
  }, [currentShotId, currentSelectType])
  const wrapper = useRef<HTMLDivElement>(null)
  const size = useSize(wrapper)
  const hasMore = useMemo(() => {
    if (!currentSelectType || !currentShotId) return false
    const cur = get(messageListMap, `${currentSelectType}.${currentShotId}`)
    if (!cur) return true
    const total = cur.total
    const messageListLength = (cur.data || []).length
    return total !== null ? messageListLength < total : true
  }, [currentSelectType, messageListMap, currentShotId])
  useEffect(() => {
    console.log('%c hasMore', 'color:red;', hasMore, size?.height)
  }, [hasMore, size])
  return (
    <Layout.Content id='script-to-video-wrapper' ref={wrapper}>
      {size?.height && currentShotId && currentSelectType ? (
        <InfiniteScroll
          height={size?.height}
          dataLength={get(messageListMap, `${currentSelectType}.${currentShotId}.data`, []).length}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          next={() => loadMoreData(true)}
          hasMore={hasMore}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
          // scrollableTarget={'scrollableDiv'}
          inverse={true}>
          {get(messageListMap, `${currentSelectType}.${currentShotId}.data`, []).map(item => {
            return (
              <MessageLayout key={item.taskId} data={item}>
                <Flex vertical={true}>
                  <div>
                    {/* shotId:{item.shotId}-historyId:{item.historyId} */}
                    {item.content || item.text}
                  </div>
                  <MaterialContent data={item} />
                  <MaterialState data={item} />
                  <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
                    {item.options?.map(v => {
                      return (
                        <ActionBtn
                          key={v.label}
                          value={v.label}
                          onClick={() => imageBtnClick(item, v)}
                          disabled={loading[item.taskId]?.[v.custom]}
                          loading={loading[item.taskId]?.[v.custom]}></ActionBtn>
                      )
                    })}
                  </Flex>
                  <ContentActionBtn item={item} />
                  <div id={String(item.historyId)}></div>
                </Flex>
              </MessageLayout>
            )
          })}
        </InfiniteScroll>
      ) : null}
    </Layout.Content>
  )
}
export default ChatContent
