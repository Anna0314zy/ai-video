import { useContext, useImperativeHandle, forwardRef } from 'react'
import { MyContext } from '../index'
import { ScriptDesign } from '../Chat/config'
import { WidgetItem } from './WidgetItem'
import { IConfig, FieldType } from './config'
import { Flex, Form, Button, Space, Input } from 'antd'
import type { FormProps } from 'antd'
const chatEnterControl = (_: any, ref: any) => {
  const { data } = useContext(MyContext)
  const [form] = Form.useForm()
  const onFinish: FormProps<FieldType>['onFinish'] = values => {
    console.log('form Success:', form.getFieldsValue())
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo)
  }
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    form,
  }))
  const config = ScriptDesign
  return (
    <Form
      form={form}
      name='basic'
      labelAlign='left'
      layout='vertical'
      initialValues={{}}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete='off'>
      <Flex wrap={true}>
        <Space>
          {config.map(item => {
            return (
              <Form.Item<FieldType> label={item.label} name={item.prop} key={item.prop}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(chatEnterControl)
