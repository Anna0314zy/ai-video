/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { Input } from 'antd'
import Typed from 'typed.js'
import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'
import MessageItem from './components/MessageItem'
import './style.less'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownIt from 'markdown-it'

interface IMessage {
  type: string
  userId: string
  content: string
  sessionId?: string
  timestamp?: string
  id: string
}

const CHAT_URL = 'https://ai-tool-test.ledupeiyou.com/api/text/v1/ai/stream/chat'


export default () => {
  let md: MarkdownIt = new MarkdownIt()
  const [inputValue, setInputValue] = useState('')
  const [messageList, setMessageList] = useState([]) as unknown as any[]
  const [currentAnswer, setCurrentAnswer] = useState('')
  const msgStore = localforage.createInstance({
    name: 'message',
  })
  const el = useRef(null)
  const typed = useRef<Typed>()
  const chatString = useRef("")
  // 聊天框内容列表
  const [chatList, setChatList] = useState<string[]>([])
  useEffect(() => {
    getAllMessage().then(res => {
      setMessageList(res)
    })
  }, [])

  // 解码包含Unicode转义序列的字符串
  function decodeUnicode(str: string): string {
    return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
      return String.fromCharCode(parseInt(match.substr(2), 16))
    })
  }

  const formatMessage = (message: IMessage) => {
    return {
      type: message.type,
      userId: message.userId,
      timestamp: Date.now().toString(),
      content: message.content,
      sessionId: uuidv4(),
      id: Date.now().toString(),
    }
  }

  const formatReceiveMessage = (content: string) => {
    return formatMessage({
      type: "receive",
      userId: "chat-robot",
      content: content,
      sessionId: uuidv4(),
      id: Date.now().toString(),
    })
  }

  const formatSendMessage = (content: string) => {
    return formatMessage({
      type: "send",
      userId: "user-test",
      content: content,
      sessionId: uuidv4(),
      id: Date.now().toString(),
    })
  }

  // 处理输入框值改变的事件
  const handleInputChange = (e: any) => {
    setInputValue(e.target.value)
  }
  const getAllMessage = async () => {
    const keys = await msgStore.keys()
    const allValues = []
    for (const key of keys) {
      const value = await msgStore.getItem(key)
      if (value) {
        allValues.push(value)
      }
    }
    return allValues
  }

  const sendMessage = async () => {
     let result = ""
    // 请求数据，流式输出
    await fetchEventSource(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization:localStorage.getItem('token')||'',
      },
      body: JSON.stringify({
        text: inputValue,
      }),
      async onmessage(ev) {
        result += ev.data
        setCurrentAnswer(result)
        const ans= decodeUnicode(result)
        const html = md.render(ans)
        if(typed.current) {
          typed.current.destroy();
        }
        typed.current = new Typed(el.current, {
          strings: [html],
          typeSpeed: 50,
        })
      },
      //会话发送完毕时触发
      onclose() {
        const ans= decodeUnicode(result)
        const formatMessage = formatReceiveMessage(ans)
        handleReceiveMessage(formatMessage)
      },
    })
  }

  const handleReceiveMessage = (formatMessage: IMessage) => {
    msgStore.setItem(formatMessage.id, formatMessage).then(async () => {
      const res = await getAllMessage()
      setMessageList(res)
    })
  }

  const handleSendMessage = async () => {
    if(inputValue === '') {
      return
    }
    const formatMsg = formatSendMessage(inputValue)
    msgStore.setItem(formatMsg.id, formatMsg).then(async () => {
      const res = await getAllMessage()
      setMessageList(res)
      setInputValue('')
      sendMessage()
    })
  }
  return (
    <>
      <div className='chat-container'>
        <div className='message-list'>
          {messageList.map((item: any) => {
            return <MessageItem key={item.id} messageInfo={item}></MessageItem>
          })}
          <div>
            <span ref={el}></span>
          </div>
        </div>
        <div className='input-container'>
          <Input value={inputValue} onChange={handleInputChange} />
          <button
            onClick={() => {
              handleSendMessage()
            }}>
            发送
          </button>
        </div>
      </div>
    </>
  )
}
