import { useImperativeHandle, forwardRef, useEffect } from 'react'
import { VideoDesign } from '@/pages/AIProject/components/config'
import { WidgetItem } from '@/pages/AIProject/components/WidgetInputItem'
import { Flex, Form, Space } from 'antd'
import type { FormProps } from 'antd'
import { VideoChatParams } from '@/api/types/video'
const VideoChatConfig = (_: any, ref: any) => {
  const [form] = Form.useForm()

  const onFinish: FormProps<VideoChatParams>['onFinish'] = values => {
    console.log('form Success:', form.getFieldsValue())
  }

  const onFinishFailed: FormProps<VideoChatParams>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo)
  }
  // // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    form,
  }))

  const onValuesChange = (val: Record<keyof VideoChatParams, any>) => {
    console.log('onValuesChange', val, form, Object.keys(val), Object.values(val))
  }
  function generateRandom18DigitNumber() {
    // 生成一个18位的随机数字
    const randomNumber = (Math.random() * 1e18).toFixed(0)

    // 确保结果是18位数，不足18位则前面填充0
    return randomNumber.padEnd(18, '0')
  }
  useEffect(() => {
    form.setFieldsValue({ seed: generateRandom18DigitNumber(), fps: 6 })
  }, [])
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
