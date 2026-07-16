import React, { useState, useRef, useEffect } from 'react'
import Styles from './index.module.less' // 用于样式
import { LinkOutlined, SendOutlined, StopOutlined } from '@ant-design/icons'
import { Input } from 'antd'
const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '5px',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  color: ' #000',
}
const ChatInput = ({
  prompt,
  onChange,
  onSend,
  children,
  sendDisabled,
  interrupting,
  onInterrupt,
}: {
  prompt: {
    text?: string
    fileId?: number
    fileName?: string
  }
  onChange: (val: string) => void
  onSend: (val: string) => void
  children: React.ReactNode
  sendDisabled?: boolean
  interrupting?: boolean
  onInterrupt?: () => void
}) => {
  const handleInterrupt = () => {
    if (!interrupting) return
    onInterrupt?.()
  }
  const handleSend = () => {
    if (sendDisabled) return
    if (prompt.text?.trim()) {
      onSend(prompt.text)
      onChange('')
    }
  }
  const handleChange = (e: { target: { value: any } }) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (event: { key: string; shiftKey: any; preventDefault: () => void }) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (interrupting) return
      handleSend()
    }
  }
  return (
    <div className={Styles['chat-input-container']} style={wrapperStyle}>
      {children}
      <Input.TextArea
        value={prompt.text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='给我发送消息吧'
        style={{ overflowY: 'auto', backgroundColor: '#fff', borderColor: 'transparent' }}
        autoSize={{ minRows: 1, maxRows: 6 }}
      />
      {interrupting ? (
        <StopOutlined
          title='中断输出'
          onClick={handleInterrupt}
          style={{
            cursor: 'pointer',
            color: '#ff4d4f',
          }}
        />
      ) : (
        <SendOutlined
          title='发送'
          onClick={handleSend}
          style={{
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            opacity: sendDisabled ? '0.25' : 1,
          }}
        />
      )}
    </div>
  )
}

export default ChatInput
