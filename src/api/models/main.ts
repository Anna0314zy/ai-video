import api from '../index'
import { ScriptPrompt } from '../type'
const http = import.meta.env.VITE_API_SERVER

export const chat = (params: { systemToken: string }) => {
  return api.post(`${http}/api/text/v1/ai/stream/chat`, params)
}

// 新建会话

export const createChat = (params: { projectId: number }) => {
  return api.post<number>(`${http}/api/session/create`, params)
}
// 获取会话的历史记录

export const getChatHistories = (params: { sessionId: number }) => {
  return api.post(`${http}/api/session/chat/getHistories`, params)
}
// 剧本Prompt
export const getScriptPrompt = (params: ScriptPrompt) => {
  return api.post<string>(`${http}/api/prompt/v1/generateShot/parse`, params)
}
// 获取剧本风格列表
export const getListScriptStyle = (params: { subjectName: string; scriptType: string }) => {
  return api.get<string[]>(`${http}/api/text/v1/listScriptStyle`, params)
}
// 获取剧本风格列表
export const getListScripType = (params: { subjectName: string }) => {
  return api.get<string[]>(`${http}/api/text/v1/listScriptType`, params)
}
