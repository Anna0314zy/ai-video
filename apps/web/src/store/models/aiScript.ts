import { getProjectDetail as getDetail, ProjectList, PageList } from '@/api/models/project'
import { MessageList, ScriptPageList } from '@/api/types/script'
import { createModel } from '@rematch/core'
import { RootModel } from '.'
import * as api from '@/api/models/aiScript'
import { SessionListItem } from '@/api/models/aiScript'
import { RootState } from '..'
import { get, set, uniqBy } from 'lodash-es'
import { elementScrollIntoView, convertToMarkdown } from '@/utils'
import { v4 as uuidv4 } from 'uuid'

const getMessageCreatedTime = (message: MessageList) => {
  if (typeof message.created === 'number') return message.created
  return Number(new Date(message.created || 0))
}

const sortMessagesByCreated = (messages: MessageList[]) => {
  return [...messages].sort((a, b) => getMessageCreatedTime(a) - getMessageCreatedTime(b))
}

const linkMessagesWithScripts = (messages: MessageList[], scripts: ScriptPageList[]) => {
  if (!scripts.length) return messages
  const scriptBySourceMessageId = new Map(
    scripts
      .filter(script => script.sourceMessageId)
      .map(script => [
        String(script.sourceMessageId),
        script,
      ]),
  )

  return messages.map(message => {
    const script = scriptBySourceMessageId.get(String(message.id))
    if (!script) return message
    return {
      ...message,
      scriptId: script.scriptId,
      scriptName: script.scriptName || script.name,
    }
  })
}

const pickDefaultScript = (scripts: ScriptPageList[]) => {
  return scripts.find(script => script.isFinal) || scripts[0]
}

interface AiScriptState {
  scriptPageListMap: {
    data: ScriptPageList[]
    total: number | null
    current: number
    size: number
  }
  currentSessionId?: number
  sessionList: SessionListItem[]
  currentProjectDetail: ProjectList
  messageListMap: {
    data: MessageList[]
    total: number | null
    current: number
    size: number
  }
  chatIng: boolean
  chatIngText: string
  selectedScriptId?: number
  highlightedMessageId?: number | string
}
export default createModel<RootModel>()({
  state: {
    messageListMap: {
      data: [],
      total: null,
      size: 30,
      current: 1,
    },
    scriptPageListMap: {
      data: [],
      total: null,
      size: 50,
      current: 1,
    },
    currentSessionId: 0,
    sessionList: [],
    currentProjectDetail: {} as ProjectList,
    chatIng: false,
    chatIngText: '',
    selectedScriptId: undefined,
    highlightedMessageId: undefined,
  } as AiScriptState,
  reducers: {
    updateData(state, payload: Partial<AiScriptState>) {
      return Object.assign(state, payload)
    },
    switchSession(state, sessionId: number) {
      state.currentSessionId = sessionId
      state.chatIng = false
      state.chatIngText = ''
      state.messageListMap = {
        data: [],
        total: null,
        size: state.messageListMap.size,
        current: 1,
      }
    },
    // 删除最后一项
    deleteLastMessage(state, payload: any) {
      const old = get(state, `messageListMap.data`) || []
      // 找到 requestring
      set(
        state,
        `messageListMap.data`,
        old.filter(v => !v.requesting),
      )
    },
    updateChatingMessage(state, payload: MessageList & { fromChatId: number }) {
      // 添加最新的数据
      const fromChatId = payload.fromChatId

      // const
      const oldData = (get(state, `messageListMap.data`) || []).filter(v => !v.requesting)
      const transformedData = oldData.map(item => {
        if (item.userSend) {
          item.id = fromChatId || uuidv4()
        }
        return item
      })
      set(state, `messageListMap.data`, sortMessagesByCreated(uniqBy([...transformedData, payload], 'id')))
    },
    deleteMessageByResourceId(state, params: { scriptId: number }) {
      const { scriptId } = params
      const data: MessageList[] = get(state, `messageListMap.data`) || []
      const newData = data.map(item => {
        if (item.scriptId === scriptId) {
          return Object.assign({}, item, {
            scriptId: 0,
            scriptName: '',
          })
        }
        return item
      })
      set(state, `messageListMap.data`, newData)
      if (state.selectedScriptId === scriptId) state.selectedScriptId = undefined
    },
    updateMessage(
      state,
      params: {
        data: MessageList
      },
    ) {
      const { data } = params
      const old: MessageList[] = get(state, `messageListMap.data`) || []
      const newData = old.map(item => {
        if (item.id === data.id) {
          return Object.assign({}, item, data)
        }
        return item
      })

      set(state, `messageListMap.data`, newData)
    },
    addMessage(state, data: MessageList | MessageList[]) {
      const params = Array.isArray(data) ? data : [data]
      const oldData: MessageList[] = get(state, `messageListMap.data`, [])
      const total = get(state, `messageListMap.total`) || 0
      set(state, `messageListMap.data`, sortMessagesByCreated([...oldData, ...params]))
      set(state, `messageListMap.total`, total + params.length)
      elementScrollIntoView(params[0].id)
    },
    initMessage(
      state,
      params: {
        data: PageList<MessageList>
        scroll: boolean
      },
    ) {
      const { data, scroll = true } = params
      const records = data?.records || []
      // 获取旧数据
      const old = get(state, `messageListMap.data`, [])
      const oldTotal = get(state, `messageListMap.total`)
      // 根据 scroll 参数决定是否合并新数据
      const newData = scroll ? sortMessagesByCreated(uniqBy([...records, ...old], 'id')) : sortMessagesByCreated(records)
      const linkedMessages = linkMessagesWithScripts(newData, state.scriptPageListMap.data || [])
      // 使用 set 方法更新数据，Redux Toolkit 会处理不可变性
      set(state, `messageListMap`, {
        data: linkedMessages,
        total: scroll ? oldTotal ?? data.total : data.total,
        size: data.size,
      })
    },
    initScriptMessage(
      state,
      params: {
        data: PageList<ScriptPageList>
        scroll: boolean
      },
    ) {
      const { data, scroll = true } = params
      const records = data?.records || []
      // 获取旧数据
      const old = get(state, `scriptPageListMap.data`, [])
      // 根据 scroll 参数决定是否合并新数据
      const newData = scroll ? uniqBy([...old, ...records], 'scriptId') : records
      const linkedMessages = linkMessagesWithScripts(get(state, `messageListMap.data`, []) || [], newData)
      const selectedStillExists = state.selectedScriptId && newData.some(script => script.scriptId === state.selectedScriptId)
      const defaultScript = selectedStillExists ? undefined : pickDefaultScript(newData)
      // 使用 set 方法更新数据，Redux Toolkit 会处理不可变性
      set(state, `scriptPageListMap`, {
        data: newData,
        total: data.total,
        size: data.size,
      })
      set(state, `messageListMap.data`, linkedMessages)
      if (!selectedStillExists && defaultScript) {
        state.selectedScriptId = defaultScript.scriptId
        state.highlightedMessageId = defaultScript.sourceMessageId
      }
    },
  },
  effects: dispatch => ({
    async getScriptPageList({
      projectId,
      current = 1,
      size = 50,
      scroll = false,
    }: {
      projectId: number
      current?: number
      size?: number
      scroll?: boolean
    }) {
      const res = await api.getPageScript({ projectId, current: current || 1, size })
      return dispatch.aiScript.initScriptMessage({
        data: res,
        scroll,
      })
    },
    async getChatHistories(
      { current = 1, size = 30, scroll = false }: { current: number; size?: number; scroll?: boolean },
      state: RootState,
    ) {
      const firstMessage = state.aiScript.messageListMap.data?.[0]
      const res = await api.getChatHistories({
        sessionId: state.aiScript.currentSessionId!,
        current,
        size,
        beforeCreated: scroll ? firstMessage?.created : undefined,
        beforeId: scroll ? Number(firstMessage?.id) : undefined,
      })

      const records = res.records || []
      const data = records.map(v => {
        return {
          ...v,
          messageContent: convertToMarkdown(v.messageContent || ''),
        }
      })
      dispatch.aiScript.initMessage({
        data: {
          ...res,
          records: data,
        },
        scroll,
      })
      return data
    },
    async getSessionList({ projectId }: { projectId: number }) {
      const sessionList = await api.getSessionList({ projectId })
      dispatch.aiScript.updateData({
        sessionList,
      })
      return sessionList
    },
    async createSession({ projectId }: { projectId: number }) {
      const sessionId = await api.createChat({
        projectId,
      })
      dispatch.aiScript.switchSession(sessionId)
      await dispatch.aiScript.getSessionList({ projectId })
      return sessionId
    },
    async getProjectDetail({ projectId }: { projectId: number }) {
      const { latestSessionId, project } = await getDetail(projectId)
      dispatch.aiScript.updateData({
        currentProjectDetail: project,
      })
      return latestSessionId
    },
  }),
})
