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
}

const ScriptBtn = ({ messageInfo, onResend }: ScriptBtnProps) => {
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const { currentSessionId: sessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
  const [chatContentLoading, setChatContentLoading] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>({})
  const handleClick = async (key: 'add' | 'refresh') => {
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
        await handleRefresh()
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
    const script = await api.saveScript({
      projectId,
      sessionId: sessionId!,
      sessionChatId: messageInfo.id,
      scriptText: messageInfo.messageContent,
    })
    dispatch.aiScript.updateMessage({
      data: {
        ...messageInfo,
        scriptId: script.scriptId,
        scriptName: script.scriptName || script.name,
      },
    })
    dispatch.aiScript.updateData({
      selectedScriptId: Number(script.scriptId),
      highlightedMessageId: messageInfo.id,
    })
    dispatch.aiScript.getScriptPageList({
      projectId,
    })
    message.success('标记剧本成功')
  }

  const handleSelectScript = () => {
    if (!messageInfo.scriptId) return
    dispatch.aiScript.updateData({
      selectedScriptId: Number(messageInfo.scriptId),
      highlightedMessageId: messageInfo.id,
    })
  }

  const handleRefresh = async () => {
    const sessionChatId = Number(messageInfo.id)
    if (!Number.isFinite(sessionChatId) || sessionChatId <= 0) {
      message.warning('当前消息不能重新生成')
      return
    }
    dispatch.aiScript.updateData({
      chatIng: true,
    })
    const params: ScriptSocketPayload = {
      sessionId,
      sessionChatId,
    }
    const sent = onResend(params)
    if (!sent) {
      dispatch.aiScript.updateData({
        chatIng: false,
      })
      message.error('服务端连接失败')
    }
  }
  const config: {
    key: 'add' | 'refresh'
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
  ]

  const showData = useMemo(() => {
    return messageInfo.scriptId ? config.slice(1) : config
  }, [messageInfo])
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {messageInfo.scriptId ? (
          <Tag
            style={{ color: '#FF7A2F', cursor: 'pointer' }}
            color='rgba(254, 126, 7, 0.1)'
            icon={<AntdIcon icon='script' />}
            onClick={handleSelectScript}>
            已标记：{messageInfo.scriptName || '剧本'}
          </Tag>
        ) : null}
        {showData.map(item => (
          <ActionBtn
            {...item}
            onClick={() => handleClick(item.key)}
            key={item.key}
            loading={chatContentLoading[messageInfo.id]?.[item.key]}
            disabled={
              item.key === 'refresh'
                ? chatIng
                : chatContentLoading[messageInfo.id]?.[item.key]
            }></ActionBtn>
        ))}
      </Space>
    </div>
  )
}
export default ScriptBtn
