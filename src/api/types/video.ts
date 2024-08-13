export type UploadType = 'video' | 'image' | 'audio'
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
