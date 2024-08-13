import { Space, message, Tag } from 'antd'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import { MyContext } from '@/pages/AIProject/Main/Sctipt/index'
import { useContext, useMemo, useState } from 'react'
import * as api from '@/api/models/main'
import { MessageList, Role } from '@/api/types/script'
import { v4 as uuidv4 } from 'uuid'
import useTyped from '@/pages/AIProject/Main/Sctipt/hooks/useTyped'
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
    messageList,
    typeRef,
  } = useContext(MyContext)
  const { typedText } = useTyped()
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
      } else if (key === 'refresh') {
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
    await api.saveScript({
      projectId,
      sessionId,
      sessionChatId: messageInfo.id as number,
    })
    updateMessage({
      id: messageInfo.id,
      loading: false,
    })
    message.success('标记成功')

    //刷新剧本列表
    getScriptPageList()
  }

  const handleRefresh = async () => {
    console.log(shouldRefresh, 'shouldRefresh')
    if (shouldRefresh) await getChatHistories()
    setChatIng(true)
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
        typeRef,
        uuidv4(),
      )
      updateMessage({ sending: true, created, role: Role.Gpt, id, requesting: false })
    } finally {
      setChatIng(false)
    }
  }
  const shouldRefresh = useMemo(() => {
    return messageList?.some((v: any) => v.sending)
  }, [messageList])
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
  // 查看当前是否已经添加到剧本
  const hasAdd = useMemo(() => {
    const index = (scriptPageList || []).findIndex(v => v.scriptId === messageInfo.scriptId)
    return index > -1
  }, [scriptPageList])

  const showData = useMemo(() => {
    return hasAdd ? config.slice(1) : config
  }, [hasAdd])
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {hasAdd ? (
          <Tag style={{ color: '#FF7A2F' }} color='rgba(254, 126, 7, 0.1)' icon={<AntdIcon icon='script' />}>
            剧本
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
