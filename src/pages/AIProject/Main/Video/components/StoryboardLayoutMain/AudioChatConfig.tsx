import { useContext, useImperativeHandle, forwardRef, useEffect, useState, useMemo } from 'react'
import { MyContext } from '../../MyContext'
import { AudioDesign } from '@/pages/AIProject/components/config'
import { WidgetItem } from '@/pages/AIProject/components/WidgetInputItem'
import { Flex, Form, Space } from 'antd'
import type { FormProps } from 'antd'
import { AudioChatParams } from '@/api/types/video'
import * as api from '@/api/models/video'
const changeOptions = (options: { description: string; value: string }[]) => {
  return options.map(v => ({ label: v.description, value: v.value }))
}
const AudioChatConfig = (_: any, ref: any) => {
  const { subjectName } = useContext(MyContext)
  const [languagesOptions, setLanguagesOptions] = useState<{ label: string; value: string }[]>([])
  const [stylesOptions, setStylesOptions] = useState<{ label: string; value: string }[]>([])
  const [voicesOptions, setVoicesOptions] = useState<{ label: string; value: string }[]>([])
  const [pitchOptions, setPitchOptions] = useState<{ label: string; value: string }[]>([])
  const [rateOptions, setRateOptions] = useState<{ label: string; value: string }[]>([])

  const [form] = Form.useForm()

  const onFinish: FormProps<AudioChatParams>['onFinish'] = values => {
    console.log('form Success:', form.getFieldsValue())
  }

  const onFinishFailed: FormProps<AudioChatParams>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo)
  }
  // // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    form,
  }))
  const config = useMemo(() => {
    return AudioDesign.map(v => {
      if (v.prop === 'languagesName') {
        v.options = languagesOptions
      } else if (v.prop === 'style') {
        v.options = stylesOptions
      } else if (v.prop === 'shortName') {
        v.options = voicesOptions
      } else if (v.prop === 'pitch') {
        v.options = pitchOptions
      } else if (v.prop === 'rate') {
        v.options = rateOptions
      }
      return v
    })
  }, [languagesOptions, stylesOptions, voicesOptions])

  const getAllLanguages = async () => {
    const res = await api.getAllLanguages()
    setLanguagesOptions(changeOptions(res.localeNameElementRespList))
    form?.setFieldValue('languagesName', res.localeNameElementRespList[0].value)
    getVoices()
  }
  const getVoices = async () => {
    console.log('languagesName', form.getFieldValue('languagesName'))
    const res = await api.getVoices(form.getFieldValue('languagesName'))
    setVoicesOptions(changeOptions(res.voiceElementRespList))
  }
  const getStyle = async () => {
    const res = await api.getStyles(form.getFieldValue('shortName'))
    setStylesOptions(changeOptions(res.styleElementRespList))
  }
  const getOtherAudioConfig = async () => {
    const res = await api.getOtherAudioConfig()
    setPitchOptions(changeOptions(res.pitchElementRespList))
    setRateOptions(changeOptions(res.rateElementRespList))
  }

  useEffect(() => {
    getAllLanguages()
    getOtherAudioConfig()
  }, [])
  const onValuesChange = (val: Record<keyof AudioChatParams, any>) => {
    console.log('onValuesChange', val, form, Object.keys(val), Object.values(val))
    if (Object.keys(val).includes('languagesName')) {
      //请求
      if (Object.values(val).filter(Boolean).length > 0) {
        form.setFieldValue('shortName', undefined)
        form.setFieldValue('style', undefined)
        setVoicesOptions([])
        setStylesOptions([])
        getVoices()
      }
    }
    if (Object.keys(val).includes('shortName')) {
      //请求
      if (Object.values(val).filter(Boolean).length > 0) {
        form.setFieldValue('style', undefined)
        setStylesOptions([])
        getStyle()
      }
    }
  }
  return (
    <Form
      form={form}
      name='basic'
      labelAlign='left'
      layout='vertical'
      initialValues={{}}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={onValuesChange}
      autoComplete='off'>
      <Flex wrap={true}>
        <Space style={{ display: 'flex', flexWrap: 'wrap' }}>
          {config.map(item => {
            return (
              <Form.Item<AudioChatParams> label={item.label} name={item.prop} key={item.prop}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(AudioChatConfig)
