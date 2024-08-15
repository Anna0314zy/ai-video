// context.js
import { createContext } from 'react'
import { MessageList, ScriptPageList, ScriptStatus } from '@/api/types/script'
interface Context {
  projectId: number
  sessionId: number
  scriptPageList: ScriptPageList[]
  currentState: keyof typeof ScriptStatus
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
