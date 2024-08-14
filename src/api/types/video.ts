export type UploadType = 'pic' | 'video' | 'voice'
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
enum TaskState {
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
export interface Text2imageMessage {
  originImgUrl: string
  taskId: string
  taskState: TaskState
  compressImgUrl?: string
  content?: string
  id: number
  width: number
  height: number
  options: Text2imageMessageOptions[]
}
