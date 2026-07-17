import { useImperativeHandle, forwardRef, useEffect } from 'react'
import { ImageDesign, ImageConfig } from '@/pages/AIProject/components/config'
import { WidgetItem } from '@/pages/AIProject/components/WidgetInputItem'
import { Flex, Form, Space } from 'antd'
import { ImageChatParams } from '@/api/types/video'
const ImageChatConfig = (_: any, ref: any) => {
  const [form] = Form.useForm()
  useImperativeHandle(ref, () => ({
    form,
  }))
  useEffect(() => {
    form.setFieldsValue({
      composition: '中景',
      style: '写实电影感',
      lighting: '明亮自然光',
      aspectRatio: '16:9',
      quality: '高清',
      colorTone: '自然',
      negativePrompt: '不要文字、水印、模糊、低清晰度、畸形手',
    })
  }, [form])

  const config: ImageConfig[] = ImageDesign
  return (
    <Form form={form} name='basic' labelAlign='left' layout='vertical' initialValues={{}} autoComplete='off'>
      <Flex wrap={true}>
        <Space style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {config.map(item => {
            return (
              <Form.Item<ImageChatParams> label={item.label} name={item.prop} key={item.prop}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(ImageChatConfig)
