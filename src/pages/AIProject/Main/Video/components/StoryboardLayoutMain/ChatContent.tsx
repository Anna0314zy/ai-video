import { Layout, message } from 'antd'
import { Flex, Image } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { ChatMessageList, EnumUploadType, Text2imageMessageOptions, ResourceTypeMap } from '@/api/types/video'

import { MyContext } from '../../index'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
import MaterialContent from './MaterialContent'
import useControlMsg from '../../useControlMsg'

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

  const { projectId, messageList, getMessageList, addChatTask, searchParams, hasMore } = useContext(MyContext)
  const [loading, setLoading] = useState({})
  const [scrollLoading, setScrollLoading] = useState<boolean>(false) // 是否正在加载

  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!currentShotId) return
    getMessageList(currentSelectType, currentShotId)
  }, [currentShotId, currentSelectType])
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.taskId]: true,
    }))
    try {
      await addChatTask({
        shotId: currentShotId,
        option,
        projectId,
        requestLogId: item.id,
        type: EnumUploadType['IMAGE'],
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [item.taskId]: false,
      }))
    }
  }
  const handleClick = async (key: string, item: ChatMessageList) => {
    if (key === 'add') {
      console.log('add')
      await api.addResource({
        historyId: item.id!,
        type: item.type,
      })
      message.success(`${ResourceTypeMap[item.type]}标记成功`)
    } else if (key === 'refresh') {
      console.log('refresh')
    }
  }

  async function checkScrollPosition() {
    if (scrollLoading || !hasMore) return
    const listElement = listRef.current
    if (listElement) {
      const { scrollTop, clientHeight, scrollHeight } = listElement

      if (scrollTop + clientHeight >= scrollHeight - 150) {
        setScrollLoading(true)
        searchParams.current.current += 1
        try {
          await getMessageList(currentSelectType, currentShotId, true)
        } finally {
          setScrollLoading(false)
        }
      }
    }
  }
  return (
    <Layout.Content style={style} ref={listRef} onScroll={checkScrollPosition}>
      <div>
        {messageList.map(item => {
          return (
            <MessageLayout key={item.taskId} data={item}>
              <Flex vertical={true}>
                <div>{item.content}</div>
                <MaterialContent data={item} />
                <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
                  {item.options?.map(v => {
                    return <ActionBtn key={v.label} value={v.label} onClick={() => imageBtnClick(item, v)}></ActionBtn>
                  })}

                  {config.map(v => (
                    <ActionBtn
                      key={v.key}
                      value={v.key === 'add' ? `标记为${ResourceTypeMap[item.type]}` : v.value}
                      icon={v.icon}
                      onClick={() => handleClick(v.key, item)}></ActionBtn>
                  ))}
                </Flex>
              </Flex>
            </MessageLayout>
          )
        })}
      </div>
    </Layout.Content>
  )
}
export default ChatContent
