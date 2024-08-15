import { createContext, useEffect, useMemo, useState, useRef } from 'react'
import { ShotList, ChatMessageList } from '@/api/types/video'

interface Context {
  messageList: ChatMessageList[]
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
