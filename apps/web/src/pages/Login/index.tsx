import { Button, Form, Input, Typography, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { Dispatch } from '@/store'
import Styles from './index.module.less'

interface LoginFormValues {
  username: string
  password: string
}

const Login = () => {
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()

  const onFinish = async (values: LoginFormValues) => {
    try {
      await dispatch.auth.login(values)
      message.success('登录成功')
      navigate('/')
    } catch {
      // 错误提示由 Axios 响应拦截器统一处理。
    }
  }

  return (
    <div className={Styles['login-page']}>
      <div className={Styles['login-panel']}>
        <Typography.Title level={2}>内容 AI 工具</Typography.Title>
        <Typography.Text type='secondary'>首次输入账号密码会自动创建账号</Typography.Text>
        <Form<LoginFormValues>
          className={Styles['login-form']}
          layout='vertical'
          initialValues={{ username: 'admin',password: '123456' }}
          onFinish={onFinish}>
          <Form.Item name='username' label='用户名' rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} autoComplete='username' placeholder='admin' />
          </Form.Item>
          <Form.Item name='password' label='密码' rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete='current-password' placeholder='请输入密码' />
          </Form.Item>
          <Button type='primary' htmlType='submit' block>
            登录
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default Login
