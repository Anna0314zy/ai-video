import { useContext, useEffect, useState } from 'react'
import Style from '../index.module.less'
import ChatConfig from './components/ChatConfig'
import { Flex, Button, Space, FormInstance, Input } from 'antd'
import { useRef } from 'react'
import IconWidget from '@/components/IconWidget'
import { useSendChat } from './hooks/useSendChat'
import { LinkOutlined, SendOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { MyContext } from '../index'
import ChatInput from './components/ChatInput'
import * as api from '@/api/models/main'
import Typed from 'typed.js'
import MarkdownIt from 'markdown-it'
import { Role } from '@/api/type'
const ChatControl = (props: any) => {
  const { updateMessage, sessionId, projectId, subjectName, getChatHistories, handleCreateChat, form } =
    useContext(MyContext)
  const [prompt, setPrompt] = useState<{
    text: string
    fileId?: number
    fileName?: string
  }>({
    text: '',
    fileId: 0,
  })
  const typeRef = useRef<any>()
  // const chatRef = useRef<{ form: FormInstance<any> }>(null)
  const { formatMessage } = useSendChat(updateMessage, sessionId, projectId)
  const handleInputChange = (val: string) => {
    console.log('handleInputChange', val)
    setPrompt({
      text: val,
    })
  }
  function typedText(text: string, el: any, onComplete: () => void) {
    console.log('zy typedText', text, el)
    const md = new MarkdownIt()
    const html = md.render(typeof text === 'string' ? text : '')
    typeRef.current = new Typed(el, {
      strings: [html],
      typeSpeed: 50,
      // showCursor: false, // 隐藏光标
      onComplete: function (self) {
        onComplete()
        console.log('Typing complete!')
      },
    })
  }
  const handleApply = async (val?: { fileId: number; fileName: string } | any) => {
    const params = form.getFieldsValue()
    const promptParams = {
      ...params,
      projectId,
      subjectName,
    }
    if (typeof val?.fileId === 'number') promptParams.fileId = val?.fileId
    console.log('handleApply:', promptParams)

    const res = await api.getScriptPrompt(promptParams)
    setPrompt({
      text: res,
      fileId: val?.fileId,
      fileName: val?.fileName,
    })
    console.log('getScriptPrompt', res)
  }
  const handleSendMessage = async () => {
    if (!prompt) return
    const created = Date.now()
    const id = uuidv4()
    console.log('%c zy 请求接口', 'color:red', Date.now(), updateMessage)
    updateMessage([
      formatMessage({
        messageContent: prompt.text,
        role: Role.user,
        attachmentFileInfo: {
          fileId: prompt.fileId,
          fileName: prompt.fileName,
        },
      }),
      formatMessage({ requesting: true, created, role: Role.Gpt, id }),
    ])
    const onComplete = async () => {
      console.log('完成打字')
      await getChatHistories()
      typeRef.current?.destroy()
    }
    await api.sendChatRequest(prompt, sessionId, async val => {
      await typedText(val, props.containerRef.current, onComplete)
    })
    updateMessage(formatMessage({ sending: true, created, role: Role.Gpt, id }))
    //新建对话
  }
  // 默认参数
  useEffect(() => {
    form.setFieldsValue({
      scriptType: '启蒙/拼音', // 剧本类型
      scriptStyle: '奇幻冒险', // 剧本风格
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
  return (
    <div className={Style['chat-control']}>
      <Flex justify='space-between' wrap={false} align='center'>
        <Flex justify='center' wrap={true} align='center'>
          <Space>
            <ChatConfig />
            <Button type='primary' onClick={handleApply}>
              应用
            </Button>
          </Space>
        </Flex>
        <Flex justify='center' wrap={false} align='center' style={{ marginLeft: '10px' }}>
          <IconWidget name='chatClear' />
          <Button
            type='link'
            onClick={handleCreateChat}
            style={{ paddingRight: 0, paddingLeft: '5px', color: '#14141A' }}>
            新建对话
          </Button>
        </Flex>
      </Flex>
      <ChatInput
        value={prompt.text}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        onSuccess={handleUploadSuccess}></ChatInput>
    </div>
  )
}

export default ChatControl
