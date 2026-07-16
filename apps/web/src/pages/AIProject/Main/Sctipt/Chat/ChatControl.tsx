import { useEffect, useState, useRef, useMemo } from 'react'
import Style from '../index.module.less'
import ChatConfig from './components/ChatConfig'
import { Flex, Button, Space, message } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import ChatInput from '../../../components/ChatInput'
import ChatUpload from './components/ChatUpload'
import * as api from '@/api/models/aiScript'
import { Role } from '@/api/types/script'
import { FormInstance } from 'antd'
import { convertToMarkdown } from '@/utils'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'

interface ChatControlProps {
  connected: boolean
  onSend: (params: ScriptSocketPayload) => boolean
  onInterrupt: () => void
}

const ChatControl = ({ connected, onSend, onInterrupt }: ChatControlProps) => {
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const subjectName = getQueryParam('subjectName') as string
  const dispatch = useDispatch<Dispatch>()
  const { currentSessionId: sessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
  const [prompt, setPrompt] = useState<{
    text?: string
    fileId?: number
    fileName?: string
    promptRequestLogId?: number
  }>({
    text: '',
    fileId: 0,
    promptRequestLogId: 0,
  })
  const chatRef = useRef<{ form: FormInstance<any> }>(null)

  // 是不是文件
  const handleApply = async () => {
    const params = chatRef.current?.form.getFieldsValue()
    const promptParams = {
      ...params,
      projectId,
      subjectName,
      sessionId,
    }
    const { prompt, promptRequestLogId } = await api.getScriptPrompt(promptParams)
    const promptInfo = {
      text: prompt,
      promptRequestLogId,
      sessionId,
    }
    setPrompt(prev => {
      return {
        ...prev,
        ...promptInfo,
      }
    })
  }
  const handleSendMessage = async () => {
    if (!sessionId) {
      message.error('请先创建会话')
      return
    }
    if (!connected) {
      message.error('服务端连接失败')
      return
    }
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    let params: any = {
      sessionId,
      text: prompt.text,
      promptRequestLogId: prompt.promptRequestLogId,
    }
    if (prompt.fileId) params.attachmentFileId = prompt.fileId
    // 如果有requesting 删除requesting
    dispatch.aiScript.addMessage({
      messageContent: convertToMarkdown(prompt.text || ''),
      role: Role.user,
      attachmentFileInfo: {
        fileId: prompt.fileId,
        fileName: prompt.fileName,
      },
      id: uuidv4(),
      created: Date.now(),
      sessionId: sessionId!,
      userSend: true,
    })

    const sent = onSend(params)
    if (!sent) {
      dispatch.aiScript.updateData({
        chatIng: false,
      })
      message.error('服务端连接失败')
      return
    }
    setPrompt(prev => {
      return {
        ...prev,
        fileId: 0,
        fileName: '',
      }
    })
  }
  // 默认参数
  useEffect(() => {
    chatRef.current?.form?.setFieldsValue({
      duration: 120, // 总时长，单位秒
      shotNum: 14, // 镜头数量
      wordNum: 600, //剧本字数
    })
  }, [])
  // 上传文件
  const handleUploadSuccess = (val: { fileId: number; fileName: string }) => {
    setPrompt(prev => {
      return {
        ...prev,
        fileId: val.fileId,
        fileName: val.fileName,
      }
    })
  }
  const handleInputSend = () => {
    handleSendMessage()
  }
  const handleInputChange = (val: string) => {
    setPrompt(prev => {
      return {
        ...prev,
        text: val,
      }
    })
  }

  const sendDisabled = useMemo(() => {
    return !prompt?.text || !sessionId
  }, [prompt?.text, sessionId])
  return (
    <div className={Style['chat-control']}>
      <Flex justify='space-between' wrap={false} align='center'>
        <Flex justify='center' wrap={true} align='center'>
          <Space>
            <ChatConfig ref={chatRef} />
            <Button type='primary' onClick={handleApply}>
              应用
            </Button>
          </Space>
        </Flex>
      </Flex>
      <ChatInput
        sendDisabled={sendDisabled}
        interrupting={chatIng}
        prompt={prompt}
        onChange={handleInputChange}
        onSend={handleInputSend}
        onInterrupt={onInterrupt}>
        <ChatUpload onSuccess={handleUploadSuccess}></ChatUpload>
        {prompt.fileName ? (
          <div
            title={prompt.fileName}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
            {prompt.fileName}
          </div>
        ) : null}
      </ChatInput>
    </div>
  )
}

export default ChatControl
