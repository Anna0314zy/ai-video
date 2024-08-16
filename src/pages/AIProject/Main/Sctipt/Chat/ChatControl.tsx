import { useContext, useEffect, useState, useRef } from 'react'
import Style from '../index.module.less'
import ChatConfig from './components/ChatConfig'
import { Flex, Button, Space } from 'antd'
import IconWidget from '@/components/IconWidget'
import { v4 as uuidv4 } from 'uuid'
import { MyContext } from '../MyContext'
import ChatInput from '../../../components/ChatInput'
import ChatUpload from './components/ChatUpload'
import * as api from '@/api/models/main'
import { Role } from '@/api/types/script'
import { FormInstance } from 'antd'
import { convertToMarkdown } from '@/utils'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { SCRIPT_SEND_THOROUGH } from '@/const/socket'
const ChatControl = (props: any) => {
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)
  const { updateMessage, sessionId, chatIng, setChatIng, projectId, subjectName, handleCreateChat, stompSocket } =
    useContext(MyContext)

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
    setChatIng(true)
    let params: any = {
      sessionId,
      text: prompt.text,
      promptRequestLogId: prompt.promptRequestLogId,
      accountId,
    }
    if (prompt.fileId) params.attachmentFileId = prompt.fileId
    updateMessage([
      {
        messageContent: convertToMarkdown(prompt.text || ''),
        role: Role.user,
        attachmentFileInfo: {
          fileId: prompt.fileId,
          fileName: prompt.fileName,
        },
        id: uuidv4(),
        created: Date.now(),
      },
      { requesting: true, created: Date.now(), role: Role.Gpt, id: uuidv4() },
    ])
    stompSocket.send(SCRIPT_SEND_THOROUGH, JSON.stringify(params))
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
      shotNum: 4, // 镜头数量
      wordNum: 600, //剧本字数
    })
  }, [])
  // 上传文件
  const handleUploadSuccess = (val: { fileId: number; fileName: string }) => {
    // handleApply(val)
    setPrompt(prev => {
      return {
        ...prev,
        fileId: val.fileId,
        fileName: val.fileName,
      }
    })
  }
  const handleInputSend = () => {
    if (!prompt?.text || chatIng) return
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
        <Flex justify='center' wrap={false} align='center' style={{ marginLeft: '10px' }} onClick={handleCreateChat}>
          <IconWidget name='chatClear' />
          {/* <AntdIcon icon='createIcon' /> */}
          <Button type='link' className='chat-create'>
            新建对话
          </Button>
        </Flex>
      </Flex>
      <ChatInput prompt={prompt} onChange={handleInputChange} onSend={handleInputSend} chatIng={chatIng}>
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
