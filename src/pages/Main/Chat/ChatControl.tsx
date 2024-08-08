import { useContext, useEffect, useState, useRef } from 'react'
import Style from '../index.module.less'
import ChatConfig from './components/ChatConfig'
import { Flex, Button, Space } from 'antd'
import IconWidget from '@/components/IconWidget'
import { v4 as uuidv4 } from 'uuid'
import { MyContext } from '../index'
import ChatInput from './components/ChatInput'
import * as api from '@/api/models/main'
import { Role } from '@/api/type'
import useTyped from '../hooks/useTyped'
import { sendChatRequest } from '@/api/models/chat'
import { FormInstance } from 'antd'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { convertToMarkdown } from '@/utils'
const ChatControl = (props: any) => {
  const { updateMessage, sessionId, chatIng, setChatIng, projectId, subjectName, getChatHistories, handleCreateChat } =
    useContext(MyContext)
  const { typedText, destroy } = useTyped()
  const [prompt, setPrompt] = useState<{
    text: string
    fileId?: number
    fileName?: string
    promptRequestLogId?: number
  }>({
    text: '',
    fileId: 0,
    promptRequestLogId: 0,
  })
  const chatRef = useRef<{ form: FormInstance<any> }>(null)
  const handleInputChange = (val: string) => {
    console.log('handleInputChange', val)
    setPrompt({
      text: val,
    })
  }
  // 是不是文件
  const handleApply = async (val?: { fileId: number; fileName: string } | any) => {
    const params = chatRef.current?.form.getFieldsValue()
    const promptParams = {
      ...params,
      projectId,
      subjectName,
    }
    if (typeof val?.fileId === 'number') promptParams.fileId = val?.fileId
    console.log('handleApply:', promptParams)

    const { prompt, promptRequestLogId } = await api.getScriptPrompt(promptParams)
    const promptInfo = {
      text: prompt,
      fileId: val?.fileId,
      fileName: val?.fileName,
      promptRequestLogId,
    }
    if (val?.fileId) {
      // 上传附件 直接请求chat
      handleSendMessage(promptInfo)
    } else {
      setPrompt(promptInfo)
    }

    console.log('getScriptPrompt', prompt, promptRequestLogId)
  }
  const handleSendMessage = async (promptInfo?: any) => {
    if (chatIng) return
    setChatIng(true)
    destroy()
    try {
      await getChatHistories()
      const created = Date.now()
      const id = uuidv4()
      console.log('%c zy 请求接口', 'color:red', Date.now(), updateMessage)
      const promptParams = promptInfo || prompt
      updateMessage([
        {
          messageContent: convertToMarkdown(promptParams.text),
          role: Role.user,
          attachmentFileInfo: {
            fileId: promptParams.fileId,
            fileName: promptParams.fileName,
          },
          id: uuidv4(),
          created,
        },
        { requesting: true, created, role: Role.Gpt, id },
      ])
      await sendChatRequest(
        {
          prompt: promptParams,
          sessionId,
        },
        async val => {
          typedText(val)
        },
      )
      setChatIng(false)
      updateMessage({ sending: true, created, role: Role.Gpt, id })
    } finally {
      setChatIng(false)
    }
    //新建对话
  }
  // 默认参数
  useEffect(() => {
    chatRef.current?.form?.setFieldsValue({
      // scriptType: '启蒙/拼音', // 剧本类型
      // scriptStyle: '奇幻冒险', // 剧本风格
      // scriptTitle?: string // 剧本主题
      // characters?: string // 主角、配角，用英文逗号分隔
      duration: 120, // 总时长，单位秒
      shotNum: 3, // 镜头数量
      wordNum: 100, //剧本字数
    })
  }, [])
  // 上传文件
  const handleUploadSuccess = (val: { fileId: number; fileName: string }) => {
    handleApply(val)
  }
  const handleInputSend = () => {
    if (!prompt?.text) return
    handleSendMessage()
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
      <ChatInput
        value={prompt.text}
        onChange={handleInputChange}
        onSend={handleInputSend}
        chatIng={chatIng}
        onSuccess={handleUploadSuccess}></ChatInput>
    </div>
  )
}

export default ChatControl
