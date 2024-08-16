import api from '../index'
import { ChatMessageList, ResourceType, ShotList, Text2imageMessageOptions } from '@/api/types/video'

import { PageList } from '@/api/models/project'
import { Text2imageMessage, TaskState, AudioChatParams, AddImageTaskParams, AudioTaskParams } from '@/api/types/video'
const http = import.meta.env.VITE_API_SERVER
// 获取图片配置接口
export const getImagePromptBtnList = (shotId: number) => {
  return api.get<
    {
      btnType: string
      btnName: string
      btnValue?: string
    }[]
  >(`${http}/api/prompt/v1/parseMJPrompt/btnList`, { shotId })
}
interface ApiOptions {
  description: string
  value: string
}
// 获取所有的语言
export const getAllLanguages = () => {
  return api.get<{
    localeNameElementRespList: ApiOptions[]
  }>(`${http}/api/tts/v1/languages`)
}
//根据语言获取所有的声音
export const getVoices = (localeName: string) => {
  return api.get<{ voiceElementRespList: ApiOptions[] }>(`${http}/api/tts/v1/voices/${localeName}`)
}
//根据声音获取所有的情感
export const getStyles = (val: string) => {
  return api.get<{ styleElementRespList: ApiOptions[] }>(`${http}/api/tts/v1/styles/${val}`)
}
//  根获取其他声音参数（声调、语速等）
export const getOtherAudioConfig = () => {
  return api.get<{ pitchElementRespList: ApiOptions[]; rateElementRespList: ApiOptions[] }>(
    `${http}/api/tts/v1/otherOptions`,
  )
}
// 根据项目id获取所有分镜头信息
export const getShotListByProjectId = (projectId: number) => {
  return api.get<{ shotBaseInfoList: ShotList[] }>(`${http}/api/scriptShot/v1/shotListByProjectId`, { projectId })
}
// 添加MJ文生图任务

export const addText2imageTask = (params: AddImageTaskParams) => {
  return api.post<ChatMessageList>(`${http}/api/text2image/v1/mj/text2image/addTask`, params)
}

//保存为图片资源

export const postSaveImage = (params: { shotId: number }) => {
  return api.post<PageList<Text2imageMessage>>(`${http}/api/text2image/v1/image/resource/save`, params)
}
// 生成图片时解析prompt
export const generateImagePrompt = (params: {
  shotId: number
  button: {
    btnName: string
    btnValue: string
    btnType: string
  }
  imageUrl?: string
}) => {
  return api.post<string>(`${http}/api/prompt/v1/generateImage/parse`, params)
}

// 获取图片资源分页列表
export const getResourceList = (params: { shotId: number; pageSize?: number; pageIndex?: number; type: string }) => {
  return api.get<any>(`${http}/api/resource/v1/page`, params)
}

// 根据资源id删除
export const delResourceItem = (params: { resourceId: number; type: string }) => {
  return api.get<any>(`${http}/api/resource/v1/delete`, params)
}
// 添加资源
export const addResource = (params: { historyId: number; type: ResourceType }) => {
  return api.get<any>(`${http}/api/resource/v1/add`, params)
}

// 重新生成
export const reinstateTask = (taskId: number) => {
  return api.post<ChatMessageList>(`${http}/api/queue/v1/task/reinstateTask?taskId=${taskId}`)
}
interface HistoryParams {
  shotId: number
  current: number
  size: number
}
// 获取图片资源历史记录
export const getText2imageHistories = (params: HistoryParams) => {
  return api.get<PageList<ChatMessageList>>(`${http}/api/resource/v1/mj/image/history`, {
    shotId: params.shotId,
    pageIndex: params.current,
    pageSize: params.size,
  })
}
// 获取声音资源历史记录
export const getVideoHistories = (params: HistoryParams) => {
  return api.get<PageList<ChatMessageList>>(`${http}/api/resource/v1/svd/video/history`, {
    shotId: params.shotId,
    pageIndex: params.current,
    pageSize: params.size,
  })
}
export const getAudioHistories = (params: HistoryParams) => {
  return api.get<PageList<ChatMessageList>>(`${http}/api/resource/v1/tts/voice/history`, {
    shotId: params.shotId,
    pageIndex: params.current,
    pageSize: params.size,
  })
}
// 调svd服务生成视频

export const addVideoTask = (params: { shotId: number }) => {
  return api.post<ChatMessageList>(`${http}/api/image2video/v1/svd/generateVideo/addTask`, params)
}

export const addAudioTask = (params: AudioTaskParams) => {
  return api.post<ChatMessageList>(`${http}/api/tts/v1/genVoices`, params)
}

// 确认资源
export const confirmResource = (params: { shotId: number; resourceId: number; type: ResourceType }) => {
  return api.post<any>(`${http}/api/resource/v1/confirm`, params)
}

// 查询终选视频详情
export const getVideoDetail = (params: { shotId: number }) => {
  return api.get<any>(`${http}/api/resource/v1/final/video/detail`, params)
}

// 查询终选音频详情
export const getVoiceDetail = (params: { shotId: number }) => {
  return api.get<any>(`${http}/api/resource/v1/final/voice/detail`, params)
}

export const packageBatch = (shotIds: number[]) => {
  return api.post<any>(`${http}/api/scriptShot/v1/packageBatch`, {
    shotIds,
  })
}
