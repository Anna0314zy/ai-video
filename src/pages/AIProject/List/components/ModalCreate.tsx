import React, { forwardRef, useContext, memo, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Modal, Form, Select, Input, InputNumber, message, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import CommonModal, { ModalHandle } from '@/components/CommonModal'
import { projectSave } from '@/api/models/project'
import { subjects, grades, terms, CurriculumNos, versions, projectTypes } from '../config'
import MyContext from '../context'
import * as api from '@/api/models/project'
const ModelCreate = (_: any, ref: any) => {
  const [form] = Form.useForm() // 使用 Form.useForm() 创建表单实例
  const [formData, setFormData] = useState({})
  const [subjectNames, setSubjectNames] = useState<{ label: string; value: string }[]>([])
  const [listTermNames, setListTermNames] = useState<{ label: string; value: string }[]>([])
  const navigate = useNavigate()
  const modelRef = useRef<ModalHandle>(null)
  const { getList } = useContext(MyContext)
  // 保存配置
  const save = async () => {
    const res = await form.validateFields()
    await projectSave({
      ...res,
      gradeName: grades[res.grade],
    })
    message.success('保存成功')
    getList({
      current: 1,
    })
  }
  const cancel = () => {
    form.resetFields()
  }
  const open = () => {
    modelRef.current?.open()
  }
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    open,
  }))
  const getOptionsList = async () => {
    const [a, b] = await Promise.all([
      api.getListSubjectName(), // 注意这里加了()来调用函数
      api.getListTermName(), // 同样这里也加了()来调用函数
    ])

    setSubjectNames(
      a?.map(v => ({
        label: v,
        value: v,
      })),
    )
    setListTermNames(
      b?.map(v => ({
        label: v,
        value: v,
      })),
    )
  }
  useEffect(() => {
    getOptionsList()
  }, [])
  return (
    <CommonModal
      ref={modelRef}
      title='新建项目'
      destroyOnClose={true}
      okText='确定'
      cancelText='取消'
      onOk={save}
      onCancel={cancel}>
      <Form
        form={form}
        layout='vertical'
        style={{ width: '100%', marginTop: '40px' }}
        autoComplete='off'
        validateMessages={{ required: '${label}是必填项' }}
        initialValues={formData}>
        <Form.Item label='项目名称' name={['projectName']} rules={[{ required: true }]}>
          <Input placeholder='请输入项目名称' allowClear></Input>
        </Form.Item>
        <Row>
          <Col span={11}>
            <Form.Item label='学科' name={['subjectName']} rules={[{ required: true }]}>
              <Select placeholder='请选择学科' options={subjectNames} allowClear></Select>
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label='年级' name={['grade']} rules={[{ required: true }]}>
              <Select
                placeholder='请选择年级'
                options={grades.map((v, idx) => ({
                  label: v,
                  value: idx,
                }))}
                allowClear></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label='季度' name={['termName']} rules={[{ required: true }]}>
              <Select placeholder='请选择季度' options={listTermNames} allowClear></Select>
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label='讲次' name={['curriculumNo']} rules={[{ required: true }]}>
              <Select placeholder='请选择讲次' options={CurriculumNos} allowClear></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label='版本' name={['textbookVersion']} rules={[{ required: true }]}>
              <Select
                placeholder='请选择版本'
                options={versions.map(v => ({
                  label: v,
                  value: v,
                }))}
                allowClear></Select>
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item label='项目类型' name={['projectType']} rules={[{ required: true }]}>
              <Select
                placeholder='请选择项目类型'
                options={projectTypes.map(v => ({
                  label: v,
                  value: v,
                }))}
                allowClear></Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </CommonModal>
  )
}
export default forwardRef(ModelCreate)
