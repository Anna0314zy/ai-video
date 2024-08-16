import { useContext, useEffect, useState, useRef } from 'react'
import { ChatMessageList, Text2imageMessageOptions, Text2imageMessage } from '@/api/types/video'
import * as api from '@/api/models/video'
import { ResourceType, EnumUploadType } from '@/api/types/video'
import { message } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { AudioTaskParams, AddImageTaskParams } from '@/api/types/video'
import { uniqBy } from 'lodash-es'
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
        // 查看是否是同一个type

        const prevType = prev[0]?.type
        if (prevType === data.type || !prev[0]) {
          return uniqBy([...prev, data], 'taskId')
        }
      }
      return prev
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
        shotId,
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
        return uniqBy([...data, ...prev], 'taskId')
      })
    } else {
      setMessageList(data)
    }
    return data
  }
  const addChatTask = async (params: AudioTaskParams | AddImageTaskParams, type: ResourceType) => {
    let res = null

    if (type === EnumUploadType['IMAGE']) {
      res = await api.addText2imageTask(params as AddImageTaskParams)
    } else if (type === EnumUploadType['AUDIO']) {
      res = await api.addAudioTask(params as AudioTaskParams)
    } else if (type === EnumUploadType['VIDEO']) {
      // res = await api.addVideoTask(params as AudioTaskParams)
    }
    console.log('addChatTask----', res)
    if (res) {
      updateMessage(res)
    }
  }
  const reinstateTask = async (taskId: number) => {
    console.log('reinstateTask', taskId)
    const res = await api.reinstateTask(taskId)
    updateMessage(res)
  }

  return {
    messageList,
    updateMessage,
    getMessageList,
    addChatTask,
    reinstateTask,
  }
}
export default useControlMsg
