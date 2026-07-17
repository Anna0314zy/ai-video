import { useImperativeHandle, forwardRef, useEffect } from 'react'
import { VideoDesign } from '@/pages/AIProject/components/config'
import { WidgetItem } from '@/pages/AIProject/components/WidgetInputItem'
import { Flex, Form, Space } from 'antd'
import { VideoChatParams } from '@/api/types/video'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
const VideoChatConfig = (_: any, ref: any) => {
  const { currentShotId, shotList } = useSelector((state: RootState) => state.aiVideo)
  const currentShot = shotList.find(item => item.shotId === currentShotId)
  const [form] = Form.useForm()
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    form,
  }))
  useEffect(() => {
    form.setFieldsValue({
      prompt: currentShot?.videoPrompt || currentShot?.shotContent || currentShot?.content || '',
      cameraMovement: '缓慢推进',
      motionStrength: '轻微',
      duration: currentShot?.duration || 5,
      ratio: '16:9',
    })
  }, [currentShot?.content, currentShot?.duration, currentShot?.shotContent, currentShot?.videoPrompt, form])
  return (
    <Form form={form} name='basic' labelAlign='left' layout='vertical' initialValues={{}} autoComplete='off'>
      <Flex wrap={true}>
        <Space style={{ display: 'flex', flexWrap: 'wrap' }}>
          {VideoDesign.map(item => {
            return (
              <Form.Item<VideoChatParams> label={item.label} name={item.prop} key={item.prop} rules={item.rules}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(VideoChatConfig)
