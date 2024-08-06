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
const ChatControl = (props: any) => {
  const { updateMessage, sessionId, projectId, subjectName } = useContext(MyContext)
  const [prompt, setPrompt] = useState('')
  const chatRef = useRef<{ form: FormInstance<any> }>(null)
  const { sendMessage, formatMessage } = useSendChat(updateMessage, sessionId, projectId)
  const handleInputChange = (val: string) => {
    console.log('handleInputChange', val)
    setPrompt(val)
  }
  const handleApply = async (fileId?: any) => {
    const params = chatRef.current?.form.getFieldsValue()
    const promptParams = {
      ...params,
      projectId,
      subjectName,
    }
    if (typeof fileId === 'number') promptParams.fileId = fileId
    console.log('handleApply:', promptParams)

    const res = await api.getScriptPrompt(promptParams)
    setPrompt(res)
    console.log('getScriptPrompt', res)
  }
  const handleSendMessage = () => {
    if (!prompt) return
    const created = Date.now()
    const id = uuidv4()
    console.log('%c zy 请求接口', 'color:red', Date.now(), updateMessage)
    updateMessage([
      formatMessage({
        messageContent: prompt,
        messageRole: 'user',
      }),
      formatMessage({ requesting: true, created, messageRole: 'gpt', id }),
    ])
    //新建对话
    sendMessage(prompt, sessionId, props.containerRef, created, id)
    // chatRequest
  }
  // 默认参数
  useEffect(() => {
    chatRef.current?.form.setFieldsValue({
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
  const handleUploadSuccess = (fileId: number) => {
    handleApply(fileId)
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
        <Flex justify='center' wrap={false} align='center' style={{ marginLeft: '10px' }}>
          <IconWidget name='chatClear' />
          <Button type='link' onClick={handleApply} style={{ paddingRight: 0, paddingLeft: '5px', color: '#14141A' }}>
            新建对话
          </Button>
        </Flex>
      </Flex>
      <ChatInput
        value={prompt}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        onSuccess={handleUploadSuccess}></ChatInput>
    </div>
  )
}

export default ChatControl
