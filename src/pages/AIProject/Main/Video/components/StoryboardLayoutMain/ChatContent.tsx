import { Layout, message } from 'antd'
import { Flex, Image } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { ChatMessageList, EnumUploadType, Text2imageMessageOptions, ResourceTypeMap } from '@/api/types/video'

import { MyContext } from '../../MyContext'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
import MaterialContent from './MaterialContent'
import MaterialState from './MaterialState'
import useControlMsg from '../../useControlMsg'
import usePullToRefresh from '@/hooks/usePullToRefresh'
import ContentActionBtn from './ContentActionBtn'
const PAGE_SIZE = 5
const config: {
  key: 'add' | 'refresh'
  value: string
  icon: string
}[] = [
  {
    key: 'add',
    value: '标记为剧本',
    icon: 'add',
  },
  {
    key: 'refresh',
    value: '重新生成',
    icon: 'refresh',
  },
]
const style: React.CSSProperties = {
  backgroundColor: '#F2F3F7',
  flex: '1',
  overflow: 'auto',
  height: '100px',
}
const ChatContent = () => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)

  const { currentSelectType, currentShotId } = useSelector((state: RootState) => state.aiVideo)

  const { projectId, messageList, getMessageList, addChatTask, reinstateTask } = useContext(MyContext)
  const [loading, setLoading] = useState({})
  const [scrollLoading, setScrollLoading] = useState<boolean>(false) // 是否正在加载

  useEffect(() => {
    if (currentShotId && currentSelectType) {
      console.log('%c getMessageList', 'color:green;backgroundColor:yellow', currentShotId, currentSelectType)
      getMessageList(1, currentSelectType, currentShotId)
    }
  }, [currentShotId, currentSelectType])
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.taskId]: true,
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
        [item.taskId]: false,
      }))
    }
  }

  const { hasMore, loadMore } = usePullToRefresh(
    (current: number) => getMessageList(current, currentSelectType, currentShotId, true),
    PAGE_SIZE,
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
    }, 100)
    console.log('messageList', messageList)
  }, [messageList])

  const [canCountScroll, setCanCountScroll] = useState(false)
  useEffect(() => {
    setCanCountScroll(true)
  }, [])

  return (
    <Layout.Content
      ref={containerRef}
      style={style}
      onScroll={e => {
        // 当滚动到顶部时触发加载更多
        // 如何首次不执行
        if (e.currentTarget.scrollTop < 100 && canCountScroll) {
          loadMore()
        }
      }}>
      <div>
        {messageList.map(item => {
          return (
            <MessageLayout key={item.taskId} data={item}>
              <Flex vertical={true}>
                <div>
                  {item.taskId} | {item.content || item.text}
                </div>
                <MaterialContent data={item} />
                <MaterialState data={item} />
                <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
                  {item.options?.map(v => {
                    return <ActionBtn key={v.label} value={v.label} onClick={() => imageBtnClick(item, v)}></ActionBtn>
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
