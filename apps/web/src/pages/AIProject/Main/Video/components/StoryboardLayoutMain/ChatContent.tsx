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
import { VideoDesign, AudioChineseComp } from '../../../../components/config'
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
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
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
      current: current ? current : data?.length > 0 ? Math.floor(data.length / size) + 1 : 1,
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
  const onHandleViewParams = (item: any) => {
    let result = ''
    if (currentSelectType === 'video') {
      // VideoDesign
      for (const config of VideoDesign) {
        const name = config.label
        const value = item[config.prop] ?? item.request?.[config.prop]
        if (value !== undefined && value !== null && value !== '') {
          result += `${name}:${value} `
        }
      }
    } else if (currentSelectType === 'voice') {
      // AudioDesign
      for (const config of AudioChineseComp) {
        const name = config.label
        const value = String(item[config.prop])
        if (config.prop === 'style') {
          result += `${name}:${item[config.prop] ? value : '默认'} `
        } else {
          result += `${name}:${value} `
        }
      }
    }
    return result
  }
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
          {get(messageListMap, `${currentSelectType}.${currentShotId}.data`, []).map((item: any, index: number) => {
            const messageKey = `${item.type || currentSelectType}-${item.shotId || currentShotId}-${item.historyId || item.taskId || index}`
            return (
              <MessageLayout key={messageKey} data={item}>
                <Flex vertical={true}>
                  <div>
                    {/* shotId:{item.shotId}-historyId:{item.historyId} */}
                    <p style={{ width: '60vw', wordWrap: 'break-word' }}> {item.content || item.text}</p>

                    <br />
                    {/* 视频参数 音频参数 */}
                    {onHandleViewParams(item)}
                  </div>
                  <div style={{ width: '80%' }}>
                    <MaterialContent data={item} key={(item.compressUrl || '') + (item.originUrl || '')} />
                  </div>
                  <MaterialState data={item} />
                  <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
                    {item.options?.map((v: any, optionIndex: number) => {
                      return (
                        <ActionBtn
                          key={`${messageKey}-${v.custom || v.label || optionIndex}`}
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
