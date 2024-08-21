import { getProjectDetail as getDetail, ProjectList, PageList } from '@/api/models/project'
import { MessageList, ScriptPageList, PAGE_SIZE } from '@/api/types/script'
import { createModel } from '@rematch/core'
import { RootModel } from '.'
import * as api from '@/api/models/aiScript'
import { RootState } from '..'
import { get, set, uniqBy } from 'lodash-es'
import { elementScrollIntoView, convertToMarkdown } from '@/utils'
import { v4 as uuidv4 } from 'uuid'
let oldText = ''
interface AiScriptState {
  messageListTotalLength: number
  scriptPageListTotalLength: number
  scriptPageList: ScriptPageList[]
  currentSessionId?: number
  currentProjectDetail: ProjectList
  messageListMap: {
    data: MessageList[]
    total: number | null
    current: number
    size: number
  }
  chatIng: boolean
  chatIngText: string
  stompSocket: any
}
export default createModel<RootModel>()({
  state: {
    messageListMap: {
      data: [],
      total: null,
      size: 0,
      current: 1,
    },
    messageListTotalLength: 0,
    scriptPageListTotalLength: 0,
    scriptPageList: [],
    currentSessionId: 0,
    currentProjectDetail: {} as ProjectList,
    chatIng: false,
    chatIngText: '',
    stompSocket: null,
    // const [chatIng, setChatIng] = useState(false)
    // const [chatIngText, setChatIngText] = useState<string>('')
  } as AiScriptState,
  reducers: {
    updateData(state, payload: Partial<AiScriptState>) {
      return Object.assign(state, payload)
    },
    updateChatIngText(state, payload: string) {
      // const newText = convertToMarkdown(state.chatIngText + payload)

      // // 检查新的文oldText本是否与旧的不同，如果相同则不更新
      // if (state.chatIngText !== newText) {
      // }
      oldText += payload
      state.chatIngText = oldText + payload
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
    updateChatingMessage(state, payload: MessageList) {
      // 添加最新的数据
      console.log('zy updateChatingMessage', payload)
      const fromId = payload.fromId
      // const
      const oldData = (get(state, `messageListMap.data`) || []).filter(v => !v.requesting)
      const transformedData = oldData.map(item => {
        if (item.userSend) {
          item.id = fromId || uuidv4()
        }
        return item
      })
      set(state, `messageListMap.data`, [payload, ...transformedData])
      console.log('zy updateChatingMessage', [payload, ...transformedData])
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
      set(state, `messageListMap.data`, [...params, ...oldData])
      set(state, `messageListMap.total`, total + params.length)
      console.log('addMessage params', params, params[params.length - 1])
      console.log('elementScrollIntoView', params[params.length - 1].id)
      elementScrollIntoView(params[params.length - 1].id)
    },
    initMessage(
      state,
      params: {
        data: PageList<MessageList>
        scroll: boolean
      },
    ) {
      const { data, scroll = true } = params
      const records = (data?.records || []).reverse() || []
      // 获取旧数据
      const old = get(state, `messageListMap.data`, [])

      // 根据 scroll 参数决定是否合并新数据

      const newData = scroll ? uniqBy([...old, ...records], 'id') : records
      // 使用 set 方法更新数据，Redux Toolkit 会处理不可变性
      set(state, `messageListMap`, {
        data: newData,
        total: data.total,
        size: data.size,
      })
    },
  },
  effects: dispatch => ({
    async getScriptPageList(
      {
        projectId,
        current,
        size = PAGE_SIZE,
        scroll = false,
      }: { projectId: number; current?: number; size?: number; scroll?: boolean },
      state: RootState,
    ) {
      console.log('zy getScriptPageList', projectId, current, size, scroll)
      const res = await api.getPageScript({ projectId, current: current || 1, size })

      const records = res.records || []
      dispatch.aiScript.updateData({
        scriptPageList: scroll ? [...state.aiScript.scriptPageList, ...records] : records,
        scriptPageListTotalLength: res.total,
      })
      return records
    },
    async getChatHistories(
      { current = 1, size = 30, scroll = false }: { current: number; size?: number; scroll?: boolean },
      state: RootState,
    ) {
      if (!state.aiScript.currentSessionId) return
      const res = await api.getChatHistories({ sessionId: state.aiScript.currentSessionId!, current, size })

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
    async getProjectDetail({ projectId }: { projectId: number }, state: RootState) {
      const { latestSessionId, project } = await getDetail(projectId)
      console.log('zy getProjectDetail', latestSessionId, project)
      dispatch.aiScript.updateData({
        currentProjectDetail: project,
        currentSessionId: latestSessionId || 0,
      })
      return latestSessionId
    },
  }),
})
