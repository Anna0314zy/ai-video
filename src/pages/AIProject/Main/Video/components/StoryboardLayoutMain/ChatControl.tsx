import { Button, Flex, message, Image } from 'antd'
import { useContext, useState, useRef } from 'react'
import { MyContext } from '../../index'
import AudioChatConfig from './AudioChatConfig'
import VideoChatConfig from './VideoChatConfig'
import ImageChatConfig from './ImageChatConfig'
import ChatInput from '../../../../components/ChatInput'
import * as api from '@/api/models/video'
import CommonUpload, { IUploadOptions } from '@/components/CommonUpload'
import { RcFile } from 'antd/lib/upload'
import { EnumUploadType } from '@/api/types/video'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '10px',
}
const ChatControl = () => {
  const { currentSelectType, currentShotId } = useSelector((state: RootState) => state.aiVideo)

  const { projectId, addChatTask } = useContext(MyContext)
  const formRef = useRef<any>()
  const [prompt, setPrompt] = useState<{
    text?: string
    fileUrl?: string
  }>({
    text: '',
  })
  const chatContentConfig = () => {
    if (currentSelectType === EnumUploadType['IMAGE']) {
      return <ImageChatConfig ref={formRef}></ImageChatConfig>
    } else if (currentSelectType === EnumUploadType['VIDEO']) {
      return <VideoChatConfig ref={formRef} />
    } else if (currentSelectType === EnumUploadType['AUDIO']) {
      return <AudioChatConfig ref={formRef} />
    }
  }
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
  const handleInputSend = async () => {
    if (!prompt?.text) return
    addChatTask({
      type: EnumUploadType['IMAGE'],
      text: prompt.text,
      shotId: currentShotId,
      projectId: projectId!,
    })
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
  const handleCreatePrompt = async () => {
    console.log('formRef', formRef.current?.form.getFieldsValue())
    const params = formRef.current?.form.getFieldsValue()
    const btnList = formRef.current.btnList
    const res = await api.generateImagePrompt({
      shotId: currentShotId,
      button: {
        btnName: params.category,
        btnValue: params.btnValue,
        btnType: btnList.find((v: { btnName: string }) => v.btnName === params.category)?.btnType,
      },
      imageUrl: prompt.fileUrl,
    })
    setPrompt(prev => ({
      ...prev,
      text: res,
    }))
  }
  const onFinish = ({ uploadOptions }: { uploadOptions: IUploadOptions }) => {
    console.log('onFinish', uploadOptions, uploadOptions.cosFullPath)
    setPrompt(prev => ({
      ...prev,
      fileUrl: uploadOptions.cosFullPath,
    }))
  }
  const onError = ({ err }: { err: Error }) => {
    if (err.message) {
      message.error(err.message)
    }
  }
  const beforeUpload = (file: RcFile) => {
    console.log(file)
    return Promise.resolve(true)
  }
  return (
    <Flex vertical={true} style={style}>
      <Flex align='center'>
        <div>{chatContentConfig()}</div>
        {currentSelectType === EnumUploadType['IMAGE'] ? (
          <Button type={'primary'} style={{ marginLeft: '10px' }} onClick={handleCreatePrompt}>
            应用
          </Button>
        ) : null}
      </Flex>
      <ChatInput prompt={prompt} onChange={handleInputChange} onSend={handleInputSend}>
        <CommonUpload
          style={prompt.fileUrl ? { color: '#1975ff' } : {}}
          beforeUpload={beforeUpload}
          onFinish={onFinish}
          onError={onError}
          type={EnumUploadType['MJIMAGE']}></CommonUpload>
        {prompt.fileUrl ? <Image src={prompt.fileUrl} style={{ width: '100px', objectFit: 'contain' }} /> : null}
      </ChatInput>
    </Flex>
  )
}
export default ChatControl
