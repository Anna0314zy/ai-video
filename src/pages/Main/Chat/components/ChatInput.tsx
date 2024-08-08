import React, { useState, useRef, useEffect } from 'react'
import './index.less' // 用于样式
import { LinkOutlined, SendOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import ChatUpload from './ChatUpload'
const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #E7E7E7',
  borderRadius: '8px',
  padding: '10px',
}
const ChatInput = ({
  value,
  onChange,
  onSend,
  onSuccess,
  chatIng,
}: {
  chatIng?: boolean
  value: string
  onChange: (val: string) => void
  onSend: (val: string) => void
  onSuccess: (val: { fileId: number; fileName: string }) => void
}) => {
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
  return (
    <div className='chat-input-container'>
      <ChatUpload onSuccess={onSuccess} accept='.md,.xlsx,.docx'></ChatUpload>
      <Input.TextArea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='给我发送消息吧'
        style={{ overflowY: 'auto', backgroundColor: '#fff', borderColor: 'transparent' }}
        autoSize={{ minRows: 1, maxRows: 6 }}
      />
      <SendOutlined onClick={handleSend} style={{ cursor: chatIng ? 'not-allowed' : 'pointer' }} />
    </div>
  )
}

export default ChatInput
