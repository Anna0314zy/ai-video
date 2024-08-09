import { fetchEventSource } from '@microsoft/fetch-event-source'
import { CHAT_URL, CHAT_URL_AGAIN, chat } from '@/api/models/main'
import { convertToMarkdown } from '@/utils'
import { v4 as uuidV4 } from 'uuid'
// 是否接受消息
let acceptMessage: {
  [key: string]: boolean
} = {}
// 当前最新的acceptMessageId
let acceptMessageTarget = ''
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
  typeRef: any,
  chatId: string,
) => {
  // const chatId = uuidV4()
  console.log('zy acceptMessageTarget 销毁', typeRef?.current)
  typeRef?.current?.destroy()
  if (acceptMessageTarget) acceptMessage[acceptMessageTarget] = false
  acceptMessageTarget = chatId
  // 发出下一个新的消息时 上一个消息要关闭

  const { prompt, sessionId, sessionChatId } = params
  let url = CHAT_URL
  let result = ''
  let chatParams: any = {}
  chatParams.sessionId = sessionId
  if (sessionChatId) {
    url = CHAT_URL_AGAIN
    chatParams.sessionId = sessionId
    chatParams.sessionChatId = sessionChatId
  } else {
    chatParams.text = prompt?.text
    chatParams.promptRequestLogId = prompt?.promptRequestLogId
    chatParams.attachmentFileId = prompt?.fileId
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
        console.log('zy onmessage', ev)
        resolve(true)
        console.log(' zy acceptMessage', acceptMessage, acceptMessageTarget, acceptMessage[acceptMessageTarget])
        if (acceptMessage[acceptMessageTarget] === undefined) acceptMessage[acceptMessageTarget] = true
        if (acceptMessage[acceptMessageTarget]) {
          typedMessage(convertToMarkdown(result))
        } else {
          typeRef?.current?.destroy()
        }
      },
      onerror: error => {
        reject(true)
        console.error('Error occurred:', error)
      },

      //会话发送完毕时触发
      onclose() {
        // 接口请求成功
        resolve(true)
        console.log('zy 会话发送完毕时触发')
      },
    })
  })
}
