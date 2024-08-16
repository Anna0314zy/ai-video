import { Button, Flex, message, Image } from 'antd'
import { useContext, useState, useRef, useMemo } from 'react'
import { MyContext } from '../../MyContext'
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
  const { currentSelectType, currentShotId, shotList } = useSelector((state: RootState) => state.aiVideo)
  const currentShot = useMemo(() => {
    return shotList.find(v => v.shotId === currentShotId)
  }, [currentShotId, shotList])
  const { projectId, addChatTask } = useContext(MyContext)
  const formRef = useRef<any>()
  const [prompt, setPrompt] = useState<{
    text?: string
    fileUrl?: string
  }>({
    text: 'imagine Fantasy landscape, a serene lake surrounded by towering mountains, lush green forests, and vibrant wildflowers in full bloom. A majestic castle sits atop one of the mountains, with its spires piercing through fluffy clouds. The sky is painted with hues of pink, orange, and purple from a setting sun, casting a magical glow over the scene. --v 5 --ar 16:9 --q 2',
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
    addChatTask(
      {
        text: prompt.text,
        shotId: currentShotId,
        projectId: projectId!,
      },
      EnumUploadType['IMAGE'],
    )
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
  const handleSend = () => {
    console.log('formRef', formRef.current?.form.getFieldsValue())
    const params = formRef.current?.form.getFieldsValue()
    console.log('%c params', 'color: #ff0000;', params)
    let base = {
      ...params,
      shotId: currentShotId,
    }
    if (currentSelectType === 'voice') base.text = currentShot?.narration
    if (currentSelectType === 'video') base.conditionFactor = Number((base.conditionFactor / 100).toFixed(1))
    addChatTask(base, currentSelectType)
  }
  return (
    <Flex vertical={true} style={style}>
      <Flex align='center'>
        <div>{chatContentConfig()}</div>
        {currentSelectType === EnumUploadType['IMAGE'] ? (
          <Button type={'primary'} style={{ marginLeft: '10px' }} onClick={handleCreatePrompt}>
            应用
          </Button>
        ) : (
          <Button type={'primary'} style={{ marginLeft: '10px' }} onClick={handleSend}>
            发送
          </Button>
        )}
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
