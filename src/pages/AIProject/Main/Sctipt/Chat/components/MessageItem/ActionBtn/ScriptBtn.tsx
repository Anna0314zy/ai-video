import { Space, message, Tag } from 'antd'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import { useMemo, useState } from 'react'
import * as api from '@/api/models/aiScript'
import { MessageList, Role } from '@/api/types/script'
import { v4 as uuidv4 } from 'uuid'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { SCRIPT_SUBSCRIBE_RESEND_THOROUGH, SCRIPT_SUBSCRIBE_AGAIN_THOROUGH } from '@/const/socket'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
interface IProps {
  name: string
  onClick: (item: MessageList) => void
}
const ScriptBtn = ({ messageInfo }: { messageInfo: MessageList }) => {
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const { currentSessionId: sessionId, chatIng, stompSocket } = useSelector((state: RootState) => state.aiScript)
  const accountId = useSelector((state: RootState) => state.auth.userInfo.accountId)
  const [chatContentLoading, setChatContentLoading] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>({})
  const handleClick = async (key: 'add' | 'refresh' | 'again') => {
    setChatContentLoading((prev: any) => {
      return {
        ...prev,
        [messageInfo.id]: {
          [key]: true,
        },
      }
    })
    try {
      if (key === 'add') {
        await handleAdd()
      } else {
        await handleRefresh(key)
      }
    } finally {
      setChatContentLoading((prev: any) => {
        return {
          ...prev,
          [messageInfo.id]: {
            [key]: false,
          },
        }
      })
    }
  }
  const handleAdd = async () => {
    await api.saveScript({
      projectId,
      sessionId: sessionId!,
      sessionChatId: messageInfo.id as number,
    })
    message.success('标记剧本中~请等待')
  }

  const handleRefresh = async (key: 'refresh' | 'again') => {
    if (!stompSocket) {
      message.error('服务端连接失败')
      return
    }
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    let params: any = {
      sessionId,
      sessionChatId: messageInfo.id,
      accountId,
    }
    dispatch.aiScript.addMessage({
      requesting: true,
      created: Date.now(),
      role: Role.Gpt,
      id: uuidv4(),
      sessionId: sessionId!,
    })
    let sendKey = SCRIPT_SUBSCRIBE_RESEND_THOROUGH
    if (key === 'again') sendKey = SCRIPT_SUBSCRIBE_AGAIN_THOROUGH
    stompSocket.send(sendKey, JSON.stringify(params))
  }
  const config: {
    key: 'add' | 'refresh' | 'again'
    value: string
    icon: string
  }[] = [
    {
      key: 'add',
      value: '标记为剧本',
      icon: 'add',
    },
    {
      key: 'refresh',
      value: '重新生成',
      icon: 'refresh',
    },
    {
      key: 'again',
      value: '继续输出',
      icon: '',
    },
  ]

  const showData = useMemo(() => {
    return messageInfo.scriptId ? config.slice(1) : config
  }, [messageInfo])
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {messageInfo.scriptId ? (
          <Tag style={{ color: '#FF7A2F' }} color='rgba(254, 126, 7, 0.1)' icon={<AntdIcon icon='script' />}>
            {messageInfo.scriptName || '剧本'}
          </Tag>
        ) : null}
        {showData.map(item => (
          <ActionBtn
            {...item}
            onClick={() => handleClick(item.key as 'add')}
            key={item.key}
            loading={chatContentLoading[messageInfo.id]?.[item.key]}
            disabled={item.key === 'refresh' ? chatIng : chatContentLoading[messageInfo.id]?.[item.key]}></ActionBtn>
        ))}
      </Space>
    </div>
  )
}
export default ScriptBtn
