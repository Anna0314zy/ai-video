export enum EnumUploadType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'voice',
  MJIMAGE = 'mjImage',
}
export const ResourceTypeMap = {
  image: '图片',
  video: '视频',
  voice: '音频',
}
export type UploadType = `${EnumUploadType}`

export type ResourceType = `${Exclude<`${EnumUploadType}`, 'mjImage'>}`
export interface PathConfigList {
  cdnPath: string
  cosPathConfigList: {
    type: UploadType
    name: string
    path: string
  }[]
}
enum ShotStatus {
  completed = '已完成',
  uncompleted = '未完成',
}
// enum Status
export interface ShotList {
  shotId: number
  narration: string
  status: keyof typeof ShotStatus
  sort: number
  imageStatus?: keyof typeof ShotStatus
  videoStatus?: keyof typeof ShotStatus
  voiceStatus?: keyof typeof ShotStatus
  imageUrl?: string
  previewImage?: string
}

// 音频chat Form

export interface AudioChatParams {
  languagesName: string //语言
  style: string // 情感
  shortName: string //声音
  pitch: string //声调
  rate: string //语速
}

export interface VideoChatParams {
  conditionFactor: string //条件因子 0 -1
  fps: number //帧率，整数
  motionBucketId: number //控制镜头，
  seed: number //随机数字18位，整数
}
export interface ImageChatParams {
  category: string
  btnValue: string
}
// / 获取文生图历史记录

export enum TaskState {
  Queued = '队列中',
  Processing = '生成中',
  Completed = '已完成',
  Transcoding = '转码中',
  Failed = '已失败',
}
export interface Text2imageMessageOptions {
  custom: string
  label: string
  style: number
  type: number
}
export interface CommonMessage {
  historyId: number
  taskId: string //列表唯一值
  taskState: keyof typeof TaskState
  type: ResourceType
  created?: string
  originUrl?: string
  compressUrl?: string
  text?: string
  resourceId?: number
  resourceName?: string
  shotId: number
}
export interface Text2imageMessage extends CommonMessage {
  content?: string
  width?: number
  height?: number
  options?: Text2imageMessageOptions[]
  isTrimming?: number // 表示该资源是否可以被添加图片是否为修整，如果是1 则允许保存为图片资源
}

export type ChatMessageList = Text2imageMessage

export interface AddImageTaskParams {
  shotId: number
  text?: string
  projectId: number
  option?: Text2imageMessageOptions | string
  requestLogId?: number
}

export interface AudioTaskParams extends AudioChatParams {
  shotId: number
}
export interface VideoTaskParams extends VideoChatParams {
  shotId: number
}
export const PAGE_SIZE = 5
