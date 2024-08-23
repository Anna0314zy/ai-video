import { Button, Flex, message, Image, Space } from 'antd'
import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import AudioChatConfig from './AudioChatConfig'
import VideoChatConfig from './VideoChatConfig'
import ImageChatConfig from './ImageChatConfig'
import ChatInput from '../../../../components/ChatInput'
import * as api from '@/api/models/aiVideo'
import CommonUpload, { IUploadOptions } from '@/components/CommonUpload'
import { RcFile } from 'antd/lib/upload'
import { EnumUploadType } from '@/api/types/video'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '@/store'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '10px',
}
const ChatControl = () => {
  const dispatch = useDispatch<Dispatch>()
  const { currentSelectType, currentShotId, shotList } = useSelector((state: RootState) => state.aiVideo)
  const currentShot = useMemo(() => {
    return shotList.find(v => v.shotId === currentShotId)
  }, [currentShotId, shotList])

  useEffect(() => {
    if (!formRef.current?.form.getFieldValue('btnValue')) {
      formRef.current?.form.setFieldsValue({
        btnValue: currentShot?.midjourneyPrompt,
      })
    }
  }, [currentShot, currentSelectType])
  const projectId = Number(useParams().id)
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
  const handleInputSend = async () => {
    if (!prompt?.text) return
    await dispatch.aiVideo.addChatTask({
      data: {
        text: prompt.text,
        shotId: currentShotId,
        projectId: projectId!,
      },
      type: EnumUploadType['IMAGE'],
    })
    setPrompt({})
  }
  const handleInputChange = (val: string) => {
    setPrompt(prev => {
      return {
        ...prev,
        text: val,
      }
    })
  }
  const handleCreatePrompt = async () => {
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
    return Promise.resolve(true)
  }
  const handleSend = async () => {
    const params = formRef.current?.form.getFieldsValue()
    let base = {
      ...params,
      shotId: currentShotId,
    }
    if (currentSelectType === 'voice') {
      base.text = currentShot?.narration
      if (!currentShot?.narration) {
        return message.error('旁白不能为空')
      }
      await formRef.current?.form.validateFields()
    }
    if (currentSelectType === 'video') {
      base.conditionFactor = base.conditionFactor ? Number((base.conditionFactor / 100).toFixed(1)) : 0
      base.motionBucketId = base.motionBucketId || 0
      await formRef.current?.form.validateFields()
    }
    await dispatch.aiVideo.addChatTask({
      data: base,
      type: currentSelectType,
    })
  }
  const [loading, setLoading] = useState(false)
  const handleTranslate = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.translateToEnglish(formRef.current?.form.getFieldValue('btnValue'))
      formRef.current?.form.setFieldsValue({
        btnValue: data,
      })
    } finally {
      setLoading(false)
    }
  }, [])
  return (
    <Flex vertical={true} style={style}>
      <Flex align='center'>
        <div>{chatContentConfig()}</div>
        {currentSelectType === EnumUploadType['IMAGE'] ? (
          <Space>
            <Button type={'primary'} loading={loading} disabled={loading} onClick={handleTranslate}>
              翻译
            </Button>
            <Button type={'primary'} onClick={handleCreatePrompt}>
              应用
            </Button>
          </Space>
        ) : (
          <Button type={'primary'} style={{ margin: '0 10px' }} onClick={handleSend}>
            发送
          </Button>
        )}
      </Flex>
      {currentSelectType === EnumUploadType['IMAGE'] && (
        <ChatInput prompt={prompt} onChange={handleInputChange} onSend={handleInputSend}>
          <CommonUpload
            accept='image/*'
            style={prompt.fileUrl ? { color: '#1975ff' } : {}}
            beforeUpload={beforeUpload}
            onFinish={onFinish}
            onError={onError}
            type={EnumUploadType['MJIMAGE']}></CommonUpload>
          {prompt.fileUrl ? <Image src={prompt.fileUrl} style={{ width: '100px', objectFit: 'contain' }} /> : null}
        </ChatInput>
      )}
    </Flex>
  )
}
export default ChatControl
