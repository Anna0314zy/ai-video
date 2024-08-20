// context.js
import { createContext } from 'react'
import { MessageList, ScriptPageList, ScriptStatus } from '@/api/types/script'
interface Context {
  projectId: number
  projectName: string
  subjectName: string
  chatIng: boolean
  setChatIng: React.Dispatch<React.SetStateAction<boolean>>
  stompSocket: any
}
export const MyContext = createContext<Context>({} as Context)
