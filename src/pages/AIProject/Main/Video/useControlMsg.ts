import { useContext, useEffect, useState, useRef } from 'react'
import { ChatMessageList, Text2imageMessageOptions, Text2imageMessage } from '@/api/types/video'
import * as api from '@/api/models/video'
import { ResourceType, EnumUploadType } from '@/api/types/video'
import { message } from 'antd'
const useControlMsg = () => {
  const [messageList, setMessageList] = useState<ChatMessageList[]>([])
  const [hasMore, setHasMore] = useState(true) // 是否有更多数据
  const searchParams = useRef<{
    current: number
    size: number
  }>({
    current: 1,
    size: 5,
  })
  useEffect(() => {
    console.log('%czy messageList', 'color:red;backgroundColor:green', messageList)
  }, [messageList])
  const updateMessage = (data: ChatMessageList) => {
    setMessageList((prev: ChatMessageList[]) => {
      if (prev.some((item: ChatMessageList) => item.taskId === data.taskId)) {
        return prev.map(item => {
          console.log('---setMessageList---', item.taskId, data.taskId, item.taskId === data.taskId)
          if (item.taskId === data.taskId) {
            return Object.assign({}, item, data)
          }
          return item
        })
      } else {
        console.log('updateMessage', prev, prev.concat(data))
        return [...prev, data]
      }
    })
  }
  const getText2imageHistories = async (shotId: number): Promise<Text2imageMessage[]> => {
    const res = await api.getText2imageHistories({
      shotId,
      ...searchParams.current,
    })
    console.log(res, 'res', res.records?.length < searchParams.current.size)
    if (res.records?.length < searchParams.current.size) setHasMore(false)
    return res.records.map(v => ({
      ...v,
      type: EnumUploadType['IMAGE'],
    }))
  }

  const getMessageList = async (type: ResourceType, shotId: number, scroll = false) => {
    let data = null
    if (type === EnumUploadType['IMAGE']) {
      data = await getText2imageHistories(shotId)
    }
    // 获取状态为【队列中】的任务列表
    if (!scroll) {
      const queuedTaskList = api.getQueuedTaskList({
        shotId,
      })
    }

    if (data) {
      if (scroll) {
        setMessageList(prev => {
          return [...prev, ...data]
        })
      } else {
        setMessageList(data)
      }
    }
  }
  const addChatTask = async ({
    type,
    text,
    shotId,
    projectId,
    option,
    requestLogId,
  }: {
    type: ResourceType
    text?: string
    shotId: number
    projectId: number
    option?: Text2imageMessageOptions
    requestLogId?: number
  }) => {
    let res = null
    if (type === EnumUploadType['IMAGE']) {
      res = await api.addText2imageTask({
        text: text,
        shotId: shotId,
        projectId: projectId,
        requestLogId,
        option,
      })
    }
    console.log('addChatTask----', res)
    if (res) {
      updateMessage({
        taskId: res.taskId,
        type: EnumUploadType['IMAGE'],
        state: res.state,
        content: res.text,
      })

      // message.success('添加成功')
    }
  }
  return {
    messageList,
    updateMessage,
    getMessageList,
    addChatTask,
    hasMore,
    searchParams,
  }
}
export default useControlMsg
