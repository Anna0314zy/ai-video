import { Button, Empty, Tooltip, message } from 'antd'
import { MessageOutlined, PlusOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import Style from '../index.module.less'

const formatSessionTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SessionSidebar = () => {
  const { id } = useParams()
  const projectId = Number(id)
  const dispatch = useDispatch<Dispatch>()
  const initializedProjectRef = useRef<number | null>(null)
  const { sessionList, currentSessionId, chatIng } = useSelector((state: RootState) => state.aiScript)
  const hasSessions = sessionList.length > 0

  useEffect(() => {
    if (!projectId || initializedProjectRef.current === projectId) return
    initializedProjectRef.current = projectId

    void (async () => {
      const latestSessionId = await dispatch.aiScript.getProjectDetail({ projectId })
      const sessions = await dispatch.aiScript.getSessionList({ projectId })
      if (!latestSessionId && sessions.length === 0) {
        await dispatch.aiScript.createSession({ projectId })
        return
      }

      const nextSessionId = latestSessionId || sessions[0]?.id || 0
      if (nextSessionId) dispatch.aiScript.switchSession(nextSessionId)
    })()
  }, [dispatch, projectId])

  const currentTitle = useMemo(() => {
    return sessionList.find(item => item.id === currentSessionId)?.title || '新会话'
  }, [currentSessionId, sessionList])

  const handleCreateSession = async () => {
    if (chatIng) {
      message.warning('当前会话正在生成中')
      return
    }
    await dispatch.aiScript.createSession({ projectId })
  }

  const handleSelectSession = (sessionId: number) => {
    if (sessionId === currentSessionId) return
    if (chatIng) {
      message.warning('当前会话正在生成中')
      return
    }
    dispatch.aiScript.switchSession(sessionId)
  }

  return (
    <aside className={Style['session-sidebar']}>
      <div className={Style['session-sidebar-header']}>
        <div className={Style['session-sidebar-title']}>会话</div>
        <Tooltip title='新建会话'>
          <Button type='primary' shape='circle' size='small' icon={<PlusOutlined />} onClick={handleCreateSession} />
        </Tooltip>
      </div>
      <div className={Style['session-current-title']}>{currentTitle}</div>
      <div className={Style['session-list']}>
        {hasSessions ? (
          sessionList.map(item => {
            const active = item.id === currentSessionId
            return (
              <button
                key={item.id}
                className={`${Style['session-item']} ${active ? Style['session-item-active'] : ''}`}
                type='button'
                onClick={() => handleSelectSession(item.id)}>
                <MessageOutlined className={Style['session-item-icon']} />
                <span className={Style['session-item-main']}>
                  <span className={Style['session-item-title']}>{item.title || '新会话'}</span>
                  <span className={Style['session-item-meta']}>
                    {item.messageCount ? `${item.messageCount} 条消息` : '暂无消息'}
                    {formatSessionTime(item.lastMessageAt || item.updatedAt)
                      ? ` · ${formatSessionTime(item.lastMessageAt || item.updatedAt)}`
                      : ''}
                  </span>
                </span>
              </button>
            )
          })
        ) : (
          <div className={Style['session-empty']}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无会话' />
          </div>
        )}
      </div>
    </aside>
  )
}

export default SessionSidebar
