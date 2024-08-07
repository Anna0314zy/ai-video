import api from '../index'
import { ScriptPrompt, MessageList } from '../type'
import { fetchEventSource } from '@microsoft/fetch-event-source'
const http = import.meta.env.VITE_API_SERVER
const CHAT_URL = `${http}/api/text/v1/ai/stream/sessionChat`
export const chat = (params: { systemToken: string }) => {
  return api.post(CHAT_URL, params)
}

// 新建会话

export const createChat = (params: { projectId: number }) => {
  return api.post<number>(`${http}/api/session/create`, params)
}
// 获取会话的历史记录

export const getChatHistories = (params: { sessionId: number }) => {
  return api.post<{ records: MessageList[] }>(`${http}/api/session/chat/getHistories`, params)
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
// 文件上传接口

export const fileUpload = (file: any) => {
  return api.post<number>(
    `${http}/api/file/v1/upload`,
    { file },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}
export const sendChatRequest = async (text: string, sessionId: number, typedMessage: (result: string) => void) => {
  let result = ''
  // 请求数据，流式输出
  return new Promise(async (resolve, reject) => {
    await fetchEventSource(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({
        text,
        sessionId,
      }),
      async onmessage(ev: any) {
        console.log('zy 会话onmessage', ev)
        result += ev.data
        typedMessage(result)
      },

      //会话发送完毕时触发
      onclose() {
        // 接口请求成功
        resolve(result)
        console.log('zy 会话发送完毕时触发')
      },
    })
  })
}
