import { useContext, useImperativeHandle, forwardRef, useEffect, useState, useMemo } from 'react'
import { MyContext } from '../../index'
import { ScriptDesign } from '../config'
import { WidgetItem } from './WidgetItem'
import { Flex, Form, Space } from 'antd'
import type { FormProps } from 'antd'
import { ScriptPrompt } from '@/api/type'
import * as api from '@/api/models/main'
const ChatConfig = (_: any, ref: any) => {
  const { subjectName } = useContext(MyContext)
  const [listScripType, setListScripType] = useState<{ label: string; value: string }[]>([])
  const [listScripStyle, setListScripStyle] = useState<{ label: string; value: string }[]>([])
  const [form] = Form.useForm()

  const onFinish: FormProps<ScriptPrompt>['onFinish'] = values => {
    console.log('form Success:', form.getFieldsValue())
  }

  const onFinishFailed: FormProps<ScriptPrompt>['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo)
  }
  // // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    form,
  }))
  const config = useMemo(() => {
    return ScriptDesign.map(v => {
      if (v.prop === 'scriptType') {
        v.options = listScripType
      }
      if (v.prop === 'scriptStyle') {
        v.options = listScripStyle
      }
      return v
    })
  }, [listScripType, listScripStyle])

  const getListScripType = async () => {
    const res = await api.getListScripType({
      subjectName,
    })
    setListScripType(res.map(v => ({ label: v, value: v })))
    form?.setFieldValue('scriptType', res[0])
    getListScriptStyle()
    console.log('getListScripType---', res)
  }
  const getListScriptStyle = async () => {
    const res = await api.getListScriptStyle({
      subjectName,
      scriptType: form.getFieldValue('scriptType'),
    })
    setListScripStyle(res.map(v => ({ label: v, value: v })))
    console.log('getListScriptStyle---', res)
  }
  useEffect(() => {
    getListScripType()
  }, [])
  const onValuesChange = (val: Record<keyof ScriptPrompt, any>) => {
    console.log('onValuesChange', val, form, Object.keys(val))
    if (Object.keys(val).includes('scriptType')) {
      //请求
      form.setFieldValue('scriptStyle', undefined)
      getListScriptStyle()
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
              <Form.Item<ScriptPrompt> label={item.label} name={item.prop} key={item.prop}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(ChatConfig)
