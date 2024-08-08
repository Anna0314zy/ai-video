import { fetchEventSource } from '@microsoft/fetch-event-source'
import { CHAT_URL, CHAT_URL_AGAIN } from '@/api/models/main'
import { convertToMarkdown } from '@/utils'
//重新生成
export const sendChatRequest = async (
  params: {
    prompt?: {
      text: string
      fileId?: number
      promptRequestLogId?: number
    }
    sessionId: number
    sessionChatId?: number
  },
  typedMessage: (result: string) => void,
) => {
  const { prompt, sessionId, sessionChatId } = params
  let url = CHAT_URL
  let result = ''
  let chatParams: any = {}
  chatParams.sessionId = sessionId
  if (sessionChatId) {
    url = CHAT_URL_AGAIN
    chatParams.sessionChatId = sessionChatId
    if (prompt?.fileId) chatParams.attachmentFileId = prompt.fileId
  } else {
    chatParams.text = prompt?.text
    chatParams.promptRequestLogId = prompt?.promptRequestLogId
  }

  // 请求数据，流式输出
  return new Promise(async (resolve, reject) => {
    await fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify(chatParams),
      async onmessage(ev: any) {
        result += ev.data
        console.log('ev', result)
        typedMessage(convertToMarkdown(result))
      },

      //会话发送完毕时触发
      onclose() {
        // 接口请求成功
        resolve(convertToMarkdown(result))
        console.log('zy 会话发送完毕时触发')
      },
    })
  })
}
