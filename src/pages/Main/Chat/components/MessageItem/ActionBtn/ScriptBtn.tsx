import { Space, message } from 'antd'
import ActionBtn from './index'
import { MyContext } from '@/pages/Main/index'
import { useContext } from 'react'
import * as api from '@/api/models/main'
import { MessageList } from '@/api/type'
interface IProps {
  name: string
  onClick: (item: MessageList) => void
}
const ScriptBtn = ({ messageInfo }: { messageInfo: MessageList }) => {
  const { form, projectId, sessionId } = useContext(MyContext)
  const config = [
    {
      key: 'add',
      value: '标记为剧本',
      icon: 'add',
      onClick: async () => {
        console.log('点击标记为剧本')
        await api.saveScript({
          projectId,
          sessionId,
          sessionChatId: messageInfo.id as number,
          promptOption: form.getFieldsValue(),
        })
        message.success('标记成功')
      },
    },
    {
      key: 'refresh',
      value: '重新生成',
      icon: 'refresh',
      onClick: () => {
        console.log('重新生成')
      },
    },
  ]
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {config.map(item => (
          <ActionBtn {...item} key={item.key}></ActionBtn>
        ))}
      </Space>
    </div>
  )
}
export default ScriptBtn
