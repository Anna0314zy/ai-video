import { useContext, useEffect, useState, useRef, useMemo } from 'react'
import Style from '../index.module.less'
import ChatConfig from './components/ChatConfig'
import { Flex, Button, Space, message } from 'antd'
import IconWidget from '@/components/IconWidget'
import { v4 as uuidv4 } from 'uuid'
import { MyContext } from '../index'
import ChatInput from '../../../components/ChatInput'
import ChatUpload from './components/ChatUpload'
import * as api from '@/api/models/main'
import { Role } from '@/api/types/script'
import useTyped from '../hooks/useTyped'
import { sendChatRequest } from '@/api/models/chat'
import { FormInstance } from 'antd'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { convertToMarkdown } from '@/utils'
const ChatControl = (props: any) => {
  const {
    updateMessage,
    sessionId,
    chatIng,
    setChatIng,
    projectId,
    subjectName,
    getChatHistories,
    handleCreateChat,
    messageList,
    typeRef,
  } = useContext(MyContext)
  const { typedText } = useTyped()
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
    // if (val?.fileId) promptParams.fileId = val?.fileId
    console.log('handleApply:', promptParams)

    const { prompt, promptRequestLogId } = await api.getScriptPrompt(promptParams)
    const promptInfo = {
      text: prompt,
      // fileId: val?.fileId,
      // fileName: val?.fileName,
      promptRequestLogId,
      sessionId,
    }
    setPrompt(prev => {
      return {
        ...prev,
        ...promptInfo,
      }
    })

    console.log('getScriptPrompt', prompt, promptRequestLogId)
  }
  const shouldRefresh = useMemo(() => {
    return messageList?.some((v: any) => v.sending)
  }, [messageList])
  const handleSendMessage = async (promptInfo?: any) => {
    if (chatIng) return
    setChatIng(true)
    setPrompt(prev => {
      return {
        ...prev,
        fileId: 0,
        fileName: '',
      }
    })
    try {
      // 如果当前有正在输出的 还是要刷新
      console.log(shouldRefresh, 'shouldRefresh')
      if (shouldRefresh) await getChatHistories()
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
        typeRef,
        uuidv4(),
      )
      setChatIng(false)
      updateMessage({ sending: true, created, role: Role.Gpt, id, requesting: false })
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
      // scriptContent?: string // 剧本主题
      // characters?: string // 主角、配角，用英文逗号分隔
      duration: 120, // 总时长，单位秒
      shotNum: 3, // 镜头数量
      wordNum: 100, //剧本字数
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
    if (!prompt?.text) return
    handleSendMessage()
  }
  const handleInputChange = (val: string) => {
    console.log('handleInputChange', val)
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
      {/* <Button
        onClick={() => {
          typeRef.current?.destroy()
        }}>
        销毁
      </Button> */}
      <ChatInput prompt={prompt} onChange={handleInputChange} onSend={handleInputSend} chatIng={chatIng}>
        <ChatUpload onSuccess={handleUploadSuccess}></ChatUpload>
      </ChatInput>
    </div>
  )
}

export default ChatControl
