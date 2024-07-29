import { useState, useEffect } from 'react'
import { Modal, Form, Select, Input, InputNumber, message, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'

interface IProps {
  visible: boolean
  close?: () => void
}

export default ({ visible, close }: IProps) => {
  const [form] = Form.useForm() // 使用 Form.useForm() 创建表单实例
  const [formData, setFormData] = useState({
    num: 1,
  })
  const navigate = useNavigate()

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
      title='新建项目'
      open={visible}
      width='500px'
      destroyOnClose={true}
      okText='确定'
      cancelText='取消'
      onOk={save}
      onCancel={close}>
      <Form
        form={form}
        layout='vertical'
        style={{ width: '100%', marginTop: '40px' }}
        autoComplete='off'
        validateMessages={{ required: '${label}是必填项' }}
        initialValues={formData}>
        <Form.Item label='项目名称' name={['name']} rules={[{ required: true }]}>
          <Input placeholder='请输入项目名称' allowClear></Input>
        </Form.Item>
        <Row>
          <Col span={11}>
            <Form.Item label='学科' name={['subject']} rules={[{ required: true }]}>
              <Select placeholder='请选择学科' options={[{ label: '古诗', value: 1 }]} allowClear></Select>
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label='年级' name={['grade']} rules={[{ required: true }]}>
              <Select placeholder='请选择年级' options={[{ label: '古诗', value: 1 }]} allowClear></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label='季度' name={['stem']} rules={[{ required: true }]}>
              <Select placeholder='请选择季度' options={[{ label: '古诗', value: 1 }]} allowClear></Select>
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label='讲次' name={['serialNumber']} rules={[{ required: true }]}>
              <Select placeholder='请选择讲次' options={[{ label: '古诗', value: 1 }]} allowClear></Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='项目类型' name={['type']} rules={[{ required: true }]}>
          <Select placeholder='请选择项目类型' options={[{ label: '古诗', value: 1 }]} allowClear></Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
