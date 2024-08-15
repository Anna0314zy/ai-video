import { useContext, useEffect, useState, useRef } from 'react'
import { ChatMessageList, Text2imageMessageOptions, Text2imageMessage } from '@/api/types/video'
import * as api from '@/api/models/video'
import { ResourceType, EnumUploadType } from '@/api/types/video'
import { message } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

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
          if (item.taskId === data.taskId) {
            return Object.assign({}, item, data)
          }
          return item
        })
      } else {
        return [...prev, data]
      }
    })
  }
  const getText2imageHistories = async (params: {
    shotId: number
    current: number
    size: number
  }): Promise<Text2imageMessage[]> => {
    const res = await api.getText2imageHistories(params)
    return res.records.map(v => ({
      ...v,
      type: EnumUploadType['IMAGE'],
    }))
  }
  const getVideoHistories = async (params: {
    shotId: number
    current: number
    size: number
  }): Promise<Text2imageMessage[]> => {
    const res = await api.getVideoHistories(params)
    return res.records.map(v => ({
      ...v,
      type: EnumUploadType['VIDEO'],
    }))
  }
  const getAudioHistories = async (params: {
    shotId: number
    current: number
    size: number
  }): Promise<Text2imageMessage[]> => {
    const res = await api.getAudioHistories(params)
    return res.records.map(v => ({
      ...v,
      type: EnumUploadType['AUDIO'],
    }))
  }

  const getMessageList = async (current: number, type: ResourceType, shotId: number, scroll = false) => {
    let data: ChatMessageList[] = []
    console.log(
      '%c getMessageList',
      'color:green;font-size:14px;background-color:yellow',
      current,
      type,
      shotId,
      scroll,
    )
    if (type === EnumUploadType['IMAGE']) {
      data = await getText2imageHistories({
        shotId,
        current,
        size: 20,
      })
    } else if (type === EnumUploadType['AUDIO']) {
      data = await getAudioHistories({
        shotId: 383,
        current,
        size: 20,
      })
    } else if (type === EnumUploadType['VIDEO']) {
      data = await getVideoHistories({
        shotId,
        current,
        size: 20,
      })
    }

    console.log('%c data', 'color:yellow', data)

    if (scroll) {
      setMessageList(prev => {
        return [...data, ...prev]
      })
    } else {
      setMessageList(data)
    }
    return data
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
        taskState: res.taskState,
        content: res.text,
      })
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
