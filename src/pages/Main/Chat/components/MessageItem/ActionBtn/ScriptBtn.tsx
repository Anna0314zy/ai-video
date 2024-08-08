import { Space, message, Tag } from 'antd'
import ActionBtn from './index'
import { MyContext } from '@/pages/Main/index'
import { useContext, useMemo, useState } from 'react'
import * as api from '@/api/models/main'
import { MessageList, ScriptPageList } from '@/api/type'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@/api/type'
import useTyped from '@/pages/Main/hooks/useTyped'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { sendChatRequest } from '@/api/models/chat'
interface IProps {
  name: string
  onClick: (item: MessageList) => void
}
const ScriptBtn = ({ messageInfo }: { messageInfo: MessageList }) => {
  const {
    getScriptPageList,
    chatIng,
    setChatIng,
    projectId,
    sessionId,
    updateMessage,
    scriptPageList,
    getChatHistories,
    disabled,
    messageList,
  } = useContext(MyContext)
  const { typedText, destroy } = useTyped()
  const [loading, setLoading] = useState({
    add: false,
    refresh: false,
  })
  const shouldRefresh = useMemo(() => {
    return messageList?.some((v: any) => v.sending)
  }, [messageList])
  const config = [
    {
      key: 'add',
      value: '标记为剧本',
      icon: 'add',
      onClick: async () => {
        console.log('点击标记为剧本')

        setLoading(prev => ({
          ...prev,
          add: true,
        }))
        updateMessage({
          id: messageInfo.id,
          loading: true,
        })
        try {
          await api.saveScript({
            projectId,
            sessionId,
            sessionChatId: messageInfo.id as number,
          })
        } finally {
          setLoading(prev => ({
            ...prev,
            add: false,
          }))
        }
        updateMessage({
          id: messageInfo.id,
          loading: false,
        })
        message.success('标记成功')
        getScriptPageList()
        getChatHistories()
        //刷新剧本列表
      },
    },
    {
      key: 'refresh',
      value: '重新生成',
      icon: 'refresh',
      onClick: async () => {
        console.log('重新生成')
        if (chatIng) return
        console.log(shouldRefresh, 'shouldRefresh')
        if (shouldRefresh) await getChatHistories()
        destroy()
        setChatIng(true)
        setLoading(prev => ({
          ...prev,
          refresh: true,
        }))
        const created = Date.now()
        const id = uuidv4()
        console.log('%c zy 请求接口', 'color:red', Date.now(), updateMessage)
        updateMessage({ requesting: true, created, role: Role.Gpt, id })
        try {
          await sendChatRequest(
            {
              sessionId,
              sessionChatId: messageInfo.id as number,
            },
            async val => {
              typedText(val)
            },
          )
        } finally {
          setChatIng(false)
          setLoading(prev => ({
            ...prev,
            refresh: false,
          }))
        }
        updateMessage({ sending: true, created, role: Role.Gpt, id })
      },
    },
  ]
  // 查看当前是否已经添加到剧本
  const hasAdd = useMemo(() => {
    return scriptPageList?.findIndex(v => v.scriptId === messageInfo.scriptId) !== -1
  }, [scriptPageList])
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {hasAdd && (
          <Tag style={{ color: '#FF7A2F' }} color='rgba(254, 126, 7, 0.1)' icon={<AntdIcon icon='script' />}>
            剧本
          </Tag>
        )}
        {hasAdd
          ? config
              .slice(1)
              .map(item => (
                <ActionBtn
                  {...item}
                  key={item.key}
                  loading={loading[item.key as 'add']}
                  disabled={item.key === 'refresh' ? chatIng : disabled || loading[item.key as 'add']}></ActionBtn>
              ))
          : config.map(item => (
              <ActionBtn
                {...item}
                key={item.key}
                loading={loading[item.key as 'add']}
                disabled={item.key === 'refresh' ? chatIng : disabled || loading[item.key as 'add']}></ActionBtn>
            ))}
      </Space>
    </div>
  )
}
export default ScriptBtn
