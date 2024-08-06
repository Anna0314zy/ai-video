import React, { useState, useRef, useEffect } from 'react'
import './index.less' // 用于样式
import { LinkOutlined, SendOutlined } from '@ant-design/icons'
import { Input } from 'antd'
const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #E7E7E7',
  borderRadius: '8px',
  padding: '10px',
}
const ChatInput = ({ value, onChange, onSend }: any) => {
  const handleSend = () => {
    if (value.trim()) {
      onSend(value)
      onChange('')
    }
  }
  const handleChange = (e: { target: { value: any } }) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (event: { key: string; shiftKey: any; preventDefault: () => void }) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  // const adjustHeight = () => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = 'auto'
  //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  //   }
  // }

  // useEffect(() => {
  //   adjustHeight()
  // }, [value])

  return (
    <div className='chat-input-container'>
      <LinkOutlined />
      <Input.TextArea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='给我发送消息吧'
        style={{ overflowY: 'auto', backgroundColor: '#fff', borderColor: 'transparent' }}
        autoSize={{ minRows: 1, maxRows: 6 }}
      />
      <SendOutlined onClick={handleSend} />
    </div>
  )
}

export default ChatInput
