/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { Input } from 'antd'
import Typed from 'typed.js'
import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'
import MessageItem from './components/MessageItem'
import './style.less'
import md from 'markdown-it'

const CHAT_URL = "https://ai-tool-test.ledupeiyou.com/api/text/v1/ai/stream/chat"
const config = {
  headers: {
    'Authorization':'eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjoiYTI3NGM1NDktYWIwMy1jZDZhLWNlYTctMWNkMDBmMmYwNmUxIiwid29ya2NvZGUiOiJQMTA2NTYwIiwibmFtZSI6Iui9pumSsOiVviIsImlzcyI6IllhY2giLCJpYXQiOjE3MjE5ODg2Mjg5Mjh9.ER4u8HETVDGORhYW48uTF8zzeZPEAHTFVIgUXe83ExM',
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  },
  responseType: 'stream'
}

export default () => {
  const [inputValue, setInputValue] = useState('')
  const [messageList, setMessageList] = useState([]) as unknown as any[]
  const [currentAnswer, setCurrentAnswer] = useState('')
  const msgStore = localforage.createInstance({
    name: 'message',
  })
  const el = useRef(null);
  const typed = useRef<Typed>();
  useEffect(() => {
    getAllMessage().then(res => {
      setMessageList(res)
    })
    // typed.current = new Typed(el.current, {
    //   strings: [currentAnswer],
    //   typeSpeed: 50,
    // });
    // console.log(typed, el.current)

    // return () => {
    //   // Destroy Typed instance during cleanup to stop animation
    //   typed.current?.destroy();
    // };
  }, [])
  const formatMessage = (message: string) => {
    return {
      type: 'send',
      userId: "test-user",
      timestamp: Date.now().toString(),
      content: message,
      sessionId: uuidv4(),
      id: Date.now().toString(),
    }
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
    try {
      let result = ""
      const xhr = new XMLHttpRequest();
      xhr.open('POST', CHAT_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjoiYTI3NGM1NDktYWIwMy1jZDZhLWNlYTctMWNkMDBmMmYwNmUxIiwid29ya2NvZGUiOiJQMTA2NTYwIiwibmFtZSI6Iui9pumSsOiVviIsImlzcyI6IllhY2giLCJpYXQiOjE3MjE5ODg2Mjg5Mjh9.ER4u8HETVDGORhYW48uTF8zzeZPEAHTFVIgUXe83ExM');

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 3 && xhr.status === 200) {
          const eventData = xhr.responseText.split('\n');
          eventData.forEach(event => {
            console.log("file: index.tsx:80 ~ useEffect ~ typed:", typed)
            result += event.replace("data:","")
            console.log("file: index.tsx:79 ~ sendMessage ~ result:", result)
            setCurrentAnswer(result)
            if(typed.current) {
              typed.current.destroy();
            }
            typed.current = new Typed(el.current, {
              strings: [result],
              typeSpeed: 50,
            })
          });
        }
      };

      xhr.send(JSON.stringify({ text:inputValue }));
    } catch (error) {
      console.log("file: index.tsx:53 ~ sendMessage ~ error:", error)
    }
  }
  const handleMessage = async () => {
    const formatMsg = formatMessage(inputValue)
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
              <span ref={el} />
            </div>
        </div>
      </div>
      <div className='input-container'>
        <Input value={inputValue} onChange={handleInputChange} />
        <button
          onClick={() => {
            handleMessage()
          }}>
          发送
        </button>
      </div>
    </>
  )
}
