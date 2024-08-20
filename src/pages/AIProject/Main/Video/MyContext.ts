import { createContext } from 'react'
import { ResourceType, ChatMessageList } from '@/api/types/video'
import { AudioTaskParams, AddImageTaskParams, VideoTaskParams } from '@/api/types/video'
interface Context {
  messageList: ChatMessageList[]
  getMessageList: (params: {
    current: number
    type: ResourceType
    shotId: number
    scroll?: boolean
    size?: number
  }) => Promise<any[]>
  updateMessage: (data: ChatMessageList) => void
  deleteMessageByResourceId: (data: { resourceId: number }) => void
  addChatTask: (params: AudioTaskParams | AddImageTaskParams | VideoTaskParams, type: ResourceType) => void
  reinstateTask: (taskId: string) => void
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
