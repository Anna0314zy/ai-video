import { Layout } from 'antd'
import { Flex } from 'antd'
import { useContext, useEffect, useState, useRef } from 'react'
import { ChatMessageList, EnumUploadType, Text2imageMessageOptions, PAGE_SIZE } from '@/api/types/video'
import { MyContext } from '../../MyContext'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
import MaterialContent from './MaterialContent'
import MaterialState from './MaterialState'
import useScrollGetData from '@/hooks/usePullToRefresh'
import ContentActionBtn from './ContentActionBtn'
const style: React.CSSProperties = {
  backgroundColor: '#F2F3F7',
  flex: '1',
  overflow: 'auto',
  height: '100px',
}
const ChatContent = () => {
  const { currentSelectType, currentShotId } = useSelector((state: RootState) => state.aiVideo)

  const { projectId, messageList, getMessageList, addChatTask, containerRef } = useContext(MyContext)
  const [loading, setLoading] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>({})
  const [scrollLoading, setScrollLoading] = useState<boolean>(false) // 是否正在加载
  const init = async () => {
    if (currentShotId && currentSelectType) {
      await getMessageList({
        current: 1,
        type: currentSelectType,
        shotId: currentShotId,
      })
    }
  }
  useEffect(() => {
    init()
  }, [currentShotId, currentSelectType])
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.taskId]: {
        [option.custom]: true,
      },
    }))
    try {
      await addChatTask(
        {
          shotId: currentShotId,
          option: option.custom,
          projectId,
          requestLogId: item.historyId,
        },
        EnumUploadType['IMAGE'],
      )
    } finally {
      setLoading(prev => ({
        ...prev,
        [item.taskId]: {
          [option.custom]: false,
        },
      }))
    }
  }

  const { loadMore } = useScrollGetData(
    (current: number) =>
      getMessageList({
        current,
        type: currentSelectType,
        shotId: currentShotId,
        scroll: true,
      }),
    PAGE_SIZE,
  )
  return (
    <Layout.Content
      ref={containerRef}
      style={style}
      onScroll={e => {
        // 当滚动到顶部时触发加载更多
        // 如何首次不执行
        if (e.currentTarget.scrollTop < 100) {
          loadMore()
        }
      }}>
      <div>
        {messageList.map(item => {
          return (
            <MessageLayout key={item.taskId} data={item}>
              <Flex vertical={true}>
                <div>
                  {/* {item.historyId} */}
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
              </Flex>
            </MessageLayout>
          )
        })}
      </div>
    </Layout.Content>
  )
}
export default ChatContent
