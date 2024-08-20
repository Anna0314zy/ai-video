import { useEffect, useState, useRef } from 'react'
import { ChatMessageList, Text2imageMessage } from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
import { ResourceType, EnumUploadType, PAGE_SIZE } from '@/api/types/video'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { AudioTaskParams, AddImageTaskParams, VideoTaskParams } from '@/api/types/video'
import { uniqBy } from 'lodash-es'
const useControlMsg = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentShotId, currentSelectType } = useSelector((state: RootState) => state.aiVideo)
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
  const deleteMessageByResourceId = (data: { resourceId: number }) => {
    setMessageList((prev: ChatMessageList[]) => {
      const newData = prev.map(item => {
        if (item.resourceId === data.resourceId) {
          return Object.assign({}, item, {
            resourceId: 0,
            resourceName: '',
          })
        }
        return item
      })
      return newData
    })
  }
  const updateMessage = (data: ChatMessageList, auto: boolean = true) => {
    if (data.type !== currentSelectType) return
    if (data.shotId && currentShotId && data.shotId !== currentShotId) return

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
        const prevShotId = prev[0]?.shotId
        if (prevType && prevType !== data.type) return prev
        if (data.shotId && prevShotId && prevShotId !== data.shotId) return prev
        return [...prev, data]
      }
    })
    if (auto) {
      setTimeout(() => {
        handleScrollBottom()
      }, 100)
    }
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

  const getMessageList = async ({
    current,
    type,
    shotId,
    scroll = false,
    size = PAGE_SIZE,
  }: {
    current: number
    type: ResourceType
    shotId: number
    scroll?: boolean
    size?: number
  }): Promise<ChatMessageList[]> => {
    let data: ChatMessageList[] = []

    if (type === EnumUploadType['IMAGE']) {
      data = await getText2imageHistories({
        shotId,
        current,
        size,
      })
    } else if (type === EnumUploadType['AUDIO']) {
      data = await getAudioHistories({
        shotId,
        current,
        size,
      })
    } else if (type === EnumUploadType['VIDEO']) {
      data = await getVideoHistories({
        shotId,
        current,
        size,
      })
    }
    if (data && data[0]?.type && data[0]?.type !== currentSelectType) return []
    if (scroll) {
      setMessageList(prev => {
        return uniqBy([...data, ...prev], 'taskId')
      })
    } else {
      setMessageList(data)
    }
    setTimeout(() => {
      handleScrollBottom()
    }, 100)
    return data
  }
  const addChatTask = async (params: AudioTaskParams | AddImageTaskParams | VideoTaskParams, type: ResourceType) => {
    let res = null

    if (type === EnumUploadType['IMAGE']) {
      res = await api.addText2imageTask(params as AddImageTaskParams)
    } else if (type === EnumUploadType['AUDIO']) {
      res = await api.addAudioTask(params as AudioTaskParams)
    } else if (type === EnumUploadType['VIDEO']) {
      res = await api.addVideoTask(params as VideoTaskParams)
    }
    if (res) {
      updateMessage(res)
    }
  }
  const reinstateTask = async (taskId: string) => {
    console.log('reinstateTask', taskId)
    const res = await api.reinstateTask(taskId)
    updateMessage(res)
  }

  const handleScrollBottom = () => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }

  return {
    messageList,
    updateMessage,
    getMessageList,
    addChatTask,
    reinstateTask,
    deleteMessageByResourceId,
    containerRef,
    handleScrollBottom,
  }
}
export default useControlMsg
