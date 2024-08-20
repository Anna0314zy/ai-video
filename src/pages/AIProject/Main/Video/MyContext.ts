import { createContext } from 'react'
import { ResourceType, ChatMessageList } from '@/api/types/video'
import { AudioTaskParams, AddImageTaskParams, VideoTaskParams } from '@/api/types/video'
interface Context {
  projectId: number
  messageList: ChatMessageList[]
  getMessageList: (params: {
    current: number
    type: ResourceType
    shotId: number
    scroll?: boolean
    size?: number
  }) => Promise<any[]>
  updateMessage: (data: ChatMessageList, auto?: boolean) => void
  deleteMessageByResourceId: (data: { resourceId: number }) => void
  addChatTask: (params: AudioTaskParams | AddImageTaskParams | VideoTaskParams, type: ResourceType) => Promise<any>
  reinstateTask: (taskId: string) => Promise<any>
  containerRef: React.RefObject<HTMLDivElement>
  handleScrollBottom: () => void
}
export const MyContext = createContext<Context>({} as Context)
