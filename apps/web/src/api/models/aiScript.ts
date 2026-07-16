import { ScriptPageList } from '@/api/types/script'
import { PageList, ProjectList } from '@/api/models/project'
import api from '../index'
import { ScriptPrompt, MessageList } from '../types/script'

const http = import.meta.env.VITE_API_SERVER
export const downloadTemplateUrl = `${http}/api/text/v1/downloadTemplate`

// 新建会话

export const createChat = (params: { projectId: number }) => {
  return api.post<number>(`${http}/api/session/create`, params)
}

export interface SessionListItem {
  id: number
  projectId: number
  title: string
  lastMessageAt?: string | null
  createdAt: string
  updatedAt: string
  messageCount: number
}

export const getSessionList = (params: { projectId: number }) => {
  return api.get<SessionListItem[]>(`${http}/api/session/list`, params)
}
// 获取会话的历史记录

export const getChatHistories = (params: {
  sessionId: number
  current: number
  size: number
  beforeCreated?: number | string
  beforeId?: number
}) => {
  return api.post<{ records: MessageList[]; size: number; total: number; current: number }>(
    `${http}/api/session/chat/getHistories`,
    params,
  )
}
// 剧本Prompt
export const getScriptPrompt = (params: ScriptPrompt) => {
  return api.post<{
    prompt: string
    promptRequestLogId: number
  }>(`${http}/api/prompt/v1/generateShot/parse`, params)
}
// 获取剧本风格列表
export const getListScriptStyle = (params: { subjectName: string; scriptType: string }) => {
  return api.get<string[]>(`${http}/api/text/v1/listScriptStyle`, params)
}
// 获取剧本风格列表
export const getListScripType = (params: { subjectName: string }) => {
  return api.get<string[]>(`${http}/api/text/v1/listScriptType`, params)
}
// 文件上传接口

export const fileUpload = (file: any) => {
  return api.post<{
    fileId: number
    fileName: string
  }>(
    `${http}/api/file/v1/upload`,
    { file },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}

interface SaveScriptParams {
  projectId: number
  sessionId: number
  sessionChatId?: number | string
  scriptText?: string
  scriptName?: string
  scriptType?: string
  scriptStyle?: string
  duration?: number
  shotNum?: number
  characters?: string
  scriptContent?: string
}
//将对话内容保存为剧本及镜头
export const saveScript = (params: SaveScriptParams) => {
  return api.post<ScriptPageList>(`${http}/api/text/v2/saveScript`, params)
}

//剧本分页查询
export const getPageScript = (params: { projectId: number; current: number; size: number }) => {
  return api.post<PageList<ScriptPageList>>(`${http}/api/text/v1/pageScript`, params)
}
//剧本预览
export const previewScript = (params: { scriptId: number }) => {
  return api.get<ScriptPageList>(`${http}/api/text/v1/previewScript`, params)
}
//导入剧本
export const uploadScript = (projectId: number, file: any) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<ScriptPageList>(
    `${http}/api/text/v1/importScript/${projectId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}
export const deleteScript = ({ projectId, scriptId }: { projectId: number; scriptId: number }) => {
  return api.del(`${http}/api/text/v1/deleteScript?scriptId=${scriptId}&projectId=${projectId}`)
}
//确认选择剧本
export const confirmScript = ({ projectId, scriptId }: { projectId: number; scriptId: number }) => {
  return api.put(`${http}/api/text/v1/confirmScript?scriptId=${scriptId}&projectId=${projectId}`)
}
