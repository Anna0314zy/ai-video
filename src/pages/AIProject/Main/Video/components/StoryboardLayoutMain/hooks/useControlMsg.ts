import { useContext, useEffect, useState } from 'react'
import { ChatMessageList, Text2imageMessageOptions } from '@/api/types/video'
import * as api from '@/api/models/video'
import { UploadType, EnumUploadType } from '@/api/types/video'
const useControlMsg = () => {
  const [messageList, setMessageList] = useState<ChatMessageList[]>([])
  const updateMessage = (data: ChatMessageList) => {
    setMessageList((prev: ChatMessageList[]) => {
      if (prev.map(v => v.taskId).includes(data.taskId)) {
        return prev.map(item => {
          if (item.taskId === data.taskId) {
            return Object.assign({}, item, data)
          }
          return item
        })
      } else {
        return prev.concat(data)
      }
    })
  }
  const getText2imageHistories = async (shotId: number) => {
    const res = await api.getText2imageHistories({
      shotId,
    })
    setMessageList(
      res.records.map(v => ({
        ...v,
        type: EnumUploadType['IMAGE'],
      })),
    )
  }

  const getMessageList = (type: UploadType, shotId: number) => {
    if (type === EnumUploadType['IMAGE']) {
      getText2imageHistories(shotId)
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
    type: UploadType
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
    if (res)
      updateMessage({
        taskId: res.taskId,
        type: EnumUploadType['IMAGE'],
        state: res.state,
        content: res.text,
      })
  }
  return {
    messageList,
    updateMessage,
    getMessageList,
    addChatTask,
  }
}
export default useControlMsg
