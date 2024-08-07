import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownIt from 'markdown-it'
import { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import { MessageList, Role } from '@/api/type'
import { v4 as uuidv4 } from 'uuid'
const CHAT_URL = `${import.meta.env.VITE_API_SERVER}/api/text/v1/ai/stream/sessionChat`
export const useSendChat = (
  updateMessage: (data: Partial<MessageList>) => void,
  sessionId: number,
  projectId: number,
) => {
  let md: MarkdownIt | null = null
  if (!md) md = new MarkdownIt()
  const typed = useRef<Typed>()
  const formatMessage = (params: Partial<MessageList>): MessageList => {
    console.log('formatMessage---', {
      created: Date.now(),
      sessionId,
      role: params.role || Role.user,
      id: uuidv4(),
      projectId,
      ...params,
    })
    return {
      created: Date.now(),
      sessionId,
      role: params.role || Role.user,
      id: uuidv4(),
      projectId,
      ...params,
    }
  }
  // 解码包含Unicode转义序列的字符串
  function decodeUnicode(str: string): string {
    return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
      return String.fromCharCode(parseInt(match.substr(2), 16))
    })
  }
  const sendMessage = async (text: string, sessionId: number, el: any, created: number, id: string) => {
    let result = ''
    // 请求数据，流式输出
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
      async onmessage(ev) {
        if (!md) return
        result += ev.data
        const ans = decodeUnicode(result)
        const html = md.render(ans)
        if (typed.current) {
          typed.current.destroy()
        }
        typed.current = new Typed(el.current, {
          strings: [html],
          typeSpeed: 50,
        })
      },

      //会话发送完毕时触发
      onclose() {
        // const ans = decodeUnicode(result)
        updateMessage?.(
          formatMessage({
            requesting: false,
            sending: true,
            created,
            messageContent: result,
            role: Role.Gpt,
            id,
          }),
        )
      },
    })
  }
  return {
    sendMessage,
    formatMessage,
    decodeUnicode,
  }
}
