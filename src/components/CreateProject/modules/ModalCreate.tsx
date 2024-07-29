import { useState, useEffect } from 'react'
import { Modal, Form, Select, InputNumber, message } from 'antd'
import { useNavigate } from "react-router-dom";

interface IProps {
  visible: boolean
  close?: () => void
}

export default ({ visible, close }: IProps) => {
  const [form] = Form.useForm() // 使用 Form.useForm() 创建表单实例
  const [formData, setFormData] = useState({
    num:1
  })
  const navigate = useNavigate();

  // 保存配置
  const save = async () => {
    form.validateFields().then(async data => {
      console.log('save', data)
      message.success('新建成功！')
      typeof close === 'function' && close()
      navigate('/edit/124124242')
    })
  }


  return (
    <Modal
      title='新建项目工程'
      open={visible}
      width='500px'
      destroyOnClose={true}
      okText='确定'
      cancelText='取消'
      onOk={save}
      onCancel={close}>
      <Form
        form={form}
        style={{ width: '100%', marginTop: '40px' }}
        autoComplete='off'
        validateMessages={{ required: '${label}是必填项' }}
        initialValues={formData}>
        <Form.Item
          label='剧本类型'
          name={['type']}
          rules={[{ required: true }]}>
          <Select placeholder='剧本类型' options={[{label:'古诗',value:1}]} allowClear></Select>
        </Form.Item>
        <Form.Item
          label='镜头数量'
          name={['num']}
          tooltip="最多99镜头"
          rules={[{ required: true }]}>
          <InputNumber min={1} max={99} precision={0} changeOnWheel={false} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
