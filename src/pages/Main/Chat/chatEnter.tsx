import Style from '../index.module.less'
import ChatEnterControl from './chatEnterControl'
import ChatEnterSend from './chatEnterSend'
import { Flex, Form, Button, Space, FormInstance } from 'antd'
import { FieldType } from '../Chat/config'
import type { FormProps } from 'antd'
import { useRef } from 'react'
const ChatEnter: React.FC = props => {
  const chatRef = useRef<{ form: FormInstance<any> }>(null)
  const handleApply = (values: FieldType) => {
    console.log('form Success:', chatRef.current?.form.getFieldsValue())
  }
  return (
    <div className={Style['chat-enter']} style={{ marginTop: '24px' }}>
      <Flex justify='center' wrap={true} align='center'>
        <Space>
          <ChatEnterControl ref={chatRef} />
          <Button type='primary' onClick={handleApply}>
            应用
          </Button>
        </Space>
      </Flex>
      <ChatEnterSend />
    </div>
  )
}

export default ChatEnter
