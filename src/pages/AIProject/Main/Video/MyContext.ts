import { createContext } from 'react'
import { ResourceType, ChatMessageList } from '@/api/types/video'

interface Context {
  messageList: ChatMessageList[]
  getMessageList: (params: {
    current: number
    type: ResourceType
    shotId: number
    scroll?: boolean
    size?: number
  }) => Promise<any[]>
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
