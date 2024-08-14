import api from '../index'
import { ShotList, Text2imageMessageOptions } from '@/api/types/video'

import { PageList } from '@/api/models/project'
import { Text2imageMessage } from '@/api/types/video'
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

export const addText2imageTask = (params: {
  shotId: number
  text: string
  projectId: number
  option?: Text2imageMessageOptions
}) => {
  return api.post<any>(`${http}/api/text2image/v1/mj/text2image/addTask`, params)
}

export const getText2imageHistories = (params: { shotId: number }) => {
  return api.post<PageList<Text2imageMessage>>(`${http}/api/text2image/v1/mj/text2image/getHistories`, params)
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

export const getResourceList = (params: { shotId: number; size?: number; current?: number }) => {
  return api.post<any>(`${http}/api/text2image/v1/image/resource/page`, params)
}
