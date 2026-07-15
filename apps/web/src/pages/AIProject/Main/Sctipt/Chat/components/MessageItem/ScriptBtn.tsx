import { Space, message, Tag } from 'antd'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import { useMemo, useState } from 'react'
import * as api from '@/api/models/aiScript'
import { MessageList } from '@/api/types/script'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import { ScriptSocketPayload } from '@/hooks/useScriptSocket'

interface ScriptBtnProps {
  messageInfo: MessageList
  onResend: (params: ScriptSocketPayload) => boolean
  onContinue: (params: ScriptSocketPayload) => boolean
}

const ScriptBtn = ({ messageInfo, onResend, onContinue }: ScriptBtnProps) => {
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const { currentSessionId: sessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
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
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    const params: ScriptSocketPayload = {
      sessionId,
      sessionChatId: messageInfo.id,
    }
    const sent = key === 'again' ? onContinue(params) : onResend(params)
    if (!sent) {
      dispatch.aiScript.updateData({
        chatIng: false,
      })
      message.error('服务端连接失败')
    }
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
