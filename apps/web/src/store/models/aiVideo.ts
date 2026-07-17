import { createModel } from '@rematch/core'
import { RootModel } from '.'
import {
  ChatMessageList,
  ResourceType,
  ShotList,
  EnumUploadType,
  AudioTaskParams,
  AddImageTaskParams,
  VideoTaskParams,
} from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
import { get, set, uniqBy } from 'lodash-es'
import { PageList } from '@/api/models/project'
import { elementScrollIntoView } from '@/utils'
interface IMessageData {
  data: ChatMessageList[]
  total: number | null
  current: number
  size: number
}
interface MessageListMap {
  image: {
    [key: string]: IMessageData
  }
  video: {
    [key: string]: IMessageData
  }
  voice: {
    [key: string]: IMessageData
  }
}

interface AiVideoState {
  currentSelectType: ResourceType
  currentShotId: number
  shotList: Array<ShotList>
  messageListMap: MessageListMap
  isShowResult: boolean
  [key: string]: any
}
export default createModel<RootModel>()({
  state: {
    selectedVideo: {},
    selectedImage: {},
    selectedAudio: {},
    selectedShot: {},
    currentSelectType: 'image',
    currentShotId: 0, // 当前选中的
    shotList: [],
    resourceList: {},
    messageListMap: {
      image: {},
      video: {},
      voice: {},
    },
    isShowResult: false,
  } as AiVideoState,
  reducers: {
    updateData(state, payload: Partial<AiVideoState>) {
      return Object.assign(state, payload)
    },
    deleteMessageByResourceId(state, params: { resourceId: number; shotId: number; type: number }) {
      const { resourceId, shotId, type } = params
      const data: ChatMessageList[] = get(state, `messageListMap.${type}.${shotId}.data`) || []
      const newData = data.map(item => {
        if (item.resourceId === resourceId) {
          return Object.assign({}, item, {
            resourceId: 0,
            resourceName: '',
          })
        }
        return item
      })
      set(state, `messageListMap.${type}.${shotId}.data`, newData)
    },
    updateMessage(
      state,
      params: {
        data: ChatMessageList
        auto?: boolean
      },
    ) {
      const { data, auto = true } = params
      const { type, shotId } = data
      const old: ChatMessageList[] = get(state, `messageListMap.${type}.${shotId}.data`) || []
      const newData = old.map(item => {
        if (item.historyId === data.historyId) {
          return Object.assign({}, item, data)
        }
        return item
      })
      set(state, `messageListMap.${type}.${shotId}.data`, newData)
    },
    addMessage(state, data: ChatMessageList) {
      const { type, shotId } = data
      const oldData: ChatMessageList[] = get(state, `messageListMap.${type}.${shotId}.data`, [])
      const total = get(state, `messageListMap.${type}.${shotId}.total`) || 0
      set(state, `messageListMap.${type}.${shotId}.data`, [data, ...oldData])
      set(state, `messageListMap.${type}.${shotId}.total`, total + 1)
      elementScrollIntoView(data.historyId)
    },
    replaceMessageByTaskId(state, data: ChatMessageList & { oldTaskId: string }) {
      const { type, shotId, oldTaskId } = data
      const oldData: ChatMessageList[] = get(state, `messageListMap.${type}.${shotId}.data`, [])
      const newData = oldData.map(item => (item.taskId === oldTaskId ? data : item))
      set(state, `messageListMap.${type}.${shotId}.data`, newData)
      elementScrollIntoView(data.historyId)
    },
    initMessage(
      state,
      params: {
        data: PageList<ChatMessageList>
        scroll: boolean
        type: ResourceType
        shotId: number
      },
    ) {
      const { data, scroll = true, type, shotId } = params
      const records = data?.records || []
      // 获取旧数据
      const old = get(state, `messageListMap.${type}.${shotId}.data`, [])

      // 根据 scroll 参数决定是否合并新数据
      const newData = scroll ? uniqBy([...old, ...records], 'historyId') : records

      // 使用 set 方法更新数据，Redux Toolkit 会处理不可变性
      set(state, `messageListMap.${type}.${shotId}`, {
        data: newData,
        total: data.total,
        size: data.size,
      })
    },
  },
  effects: dispatch => ({
    async getShotListByProjectId(id: number, state: any) {
      const { shotBaseInfoList }: any = await api.getShotListByProjectId(id)
      const { selectedShot } = state.aiVideo
      const len = Object.keys(selectedShot || {}).length
      //
      const firstUnDone = shotBaseInfoList.find((item: any) => item.status === 'uncompleted')
      console.log('%c 🚀 ~ [ firstUnDone ]-135', 'font-size:14px; background:green; color:#fff;', firstUnDone)

      dispatch.aiVideo.updateData({
        shotList: shotBaseInfoList || [],
        currentShotId: len
          ? selectedShot.shotId
          : shotBaseInfoList.length === 1
          ? shotBaseInfoList[0]?.shotId
          : firstUnDone
          ? firstUnDone?.shotId
          : shotBaseInfoList[0]?.shotId,
        selectedShot: len
          ? selectedShot
          : shotBaseInfoList.length === 1
          ? shotBaseInfoList[0]
          : firstUnDone
          ? firstUnDone
          : shotBaseInfoList[0],
        // currentSelectType: selectedShot?.previewImage || shotBaseInfoList[0]?.previewImage ? 'video' : 'image',
      })
    },
    async getResourceList(params: { shotId: number; pageSize?: number; pageIndex?: number; type: string }, state: any) {
      const { resourceList } = state.aiVideo
      const res = await api.getResourceList({
        ...params,
        pageIndex: params.pageIndex || 1,
        pageSize: params.pageSize || 50,
      })
      dispatch.aiVideo.updateData({
        resourceList:
          params.pageIndex === 1 ? res : { ...res, records: [...(resourceList?.records || []), ...res.records] },
      })
      // 已确认过的资源回显
      const finalResource = res.records.find((item: any) => item.isFinal === 'final')
      if (Object.keys(finalResource || {}).length) {
        switch (finalResource.type) {
          case 'video':
            dispatch.aiVideo.updateData({
              selectedVideo: finalResource,
            })
            break
          case 'image':
            dispatch.aiVideo.updateData({
              selectedImage: finalResource,
            })
            break
          case 'voice':
            dispatch.aiVideo.updateData({
              selectedAudio: finalResource,
            })
            break
        }
      }
    },
    async getMessageList({
      current,
      type,
      shotId,
      scroll = false,
      size = 50,
    }: {
      current: number
      type: ResourceType
      shotId: number
      scroll?: boolean
      size?: number
    }) {
      let data = {
        size: 1,
        current: 1,
        total: 0,
        records: [],
      } as PageList<ChatMessageList>
      if (type === EnumUploadType['IMAGE']) {
        data = await api.getText2imageHistories({
          shotId,
          current,
          size,
        })
      } else if (type === EnumUploadType['AUDIO']) {
        data = await api.getAudioHistories({
          shotId,
          current,
          size,
        })
      } else if (type === EnumUploadType['VIDEO']) {
        data = await api.getVideoHistories({
          shotId,
          current,
          size,
        })
      }
      dispatch.aiVideo.initMessage({
        data,
        scroll,
        type,
        shotId,
      })
    },
    async addChatTask(params: { data: AudioTaskParams | AddImageTaskParams | VideoTaskParams; type: ResourceType }) {
      const { data, type } = params
      let res = null
      const tempTaskId = `local-${Date.now()}`
      const shouldShowPending = (type === EnumUploadType['IMAGE'] || type === EnumUploadType['VIDEO']) && 'shotId' in data
      if (shouldShowPending) {
        dispatch.aiVideo.addMessage({
          historyId: Date.now(),
          taskId: tempTaskId,
          taskState: 'Processing',
          state: 'RUNNING',
          type,
          shotId: data.shotId,
          text: (data as AddImageTaskParams).text || (data as VideoTaskParams).prompt,
          content: (data as AddImageTaskParams).text || (data as VideoTaskParams).prompt,
          request: data,
        } as ChatMessageList)
      }
      try {
        if (type === EnumUploadType['IMAGE']) {
          res = await api.addText2imageTask(data as AddImageTaskParams)
        } else if (type === EnumUploadType['AUDIO']) {
          res = await api.addAudioTask(data as AudioTaskParams)
        } else if (type === EnumUploadType['VIDEO']) {
          res = await api.addVideoTask(data as VideoTaskParams)
        }

        if (res) {
          if (shouldShowPending) {
            dispatch.aiVideo.replaceMessageByTaskId({ ...res, oldTaskId: tempTaskId })
          } else {
            dispatch.aiVideo.addMessage(res)
          }
          if (type === EnumUploadType['VIDEO'] && res.taskId) {
            dispatch.aiVideo.pollTaskDetail(res)
          }
        }
      } catch (error) {
        if (shouldShowPending) {
          dispatch.aiVideo.replaceMessageByTaskId({
            historyId: Date.now(),
            taskId: tempTaskId,
            oldTaskId: tempTaskId,
            taskState: 'Failed',
            type,
            shotId: data.shotId,
            text: (error as Error)?.message || '生成任务提交失败',
            content: (error as Error)?.message || '生成任务提交失败',
            request: data,
          } as ChatMessageList & { oldTaskId: string })
        }
        throw error
      }
    },
    async pollTaskDetail(task: ChatMessageList) {
      const maxTimes = 60
      const intervalMs = 5000
      for (let index = 0; index < maxTimes; index += 1) {
        if (!['Queued', 'Processing'].includes(task.taskState)) return
        await new Promise(resolve => setTimeout(resolve, intervalMs))
        try {
          const latest = await api.getTaskDetail(task.taskId)
          dispatch.aiVideo.updateMessage({ data: latest, auto: false })
          task = latest
          if (!['Queued', 'Processing'].includes(latest.taskState)) return
        } catch (error) {
          dispatch.aiVideo.updateMessage({
            data: {
              ...task,
              taskState: 'Failed',
              state: 'FAILED',
              text: (error as Error)?.message || task.text || '任务查询失败',
              content: (error as Error)?.message || task.content || '任务查询失败',
            },
            auto: false,
          } as any)
          return
        }
      }
      dispatch.aiVideo.updateMessage({
        data: {
          ...task,
          taskState: 'Failed',
          state: 'FAILED',
          text: task.text || '任务查询超时',
          content: task.content || '任务查询超时',
        },
        auto: false,
      } as any)
    },
    async reinstateTask(taskId: string) {
      const res = await api.reinstateTask(taskId)
      dispatch.aiVideo.addMessage(res)
    },
  }),
})
