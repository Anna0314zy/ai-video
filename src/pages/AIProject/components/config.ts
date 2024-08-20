import { projectTypes } from '@/pages/AIProject/List/config'
import { ScriptPrompt } from '@/api/types/script'
import { Rule } from 'antd/lib/form'
import { AudioChatParams, VideoChatParams, ImageChatParams } from '@/api/types/video'
export interface IConfig {
  label: string
  type: WidgetType
  options?: { label: string; value: string }[]
  addonAfter?: any
  prop: keyof ScriptPrompt
  width?: number
  min?: number
  max?: number
  formatter?: any
  disabled?: boolean
  rules?: Rule[]
}

export type WidgetType = 'input' | 'inputNumber' | 'select' | 'textArea' | 'slider'

//剧本配置
export const ScriptDesign: IConfig[] = [
  {
    label: '类型',
    prop: 'scriptType',
    type: 'select',
    width: 200,
    options: projectTypes.map(v => ({ label: v, value: v })),
  },
  {
    label: '风格',
    prop: 'scriptStyle',
    type: 'select',
    options: [
      {
        label: '史诗风格',
        value: '史诗风格',
      },
    ],
  },
  {
    label: '镜头数量',
    prop: 'shotNum',
    type: 'inputNumber',
  },
  {
    label: '脚本字数',
    prop: 'wordNum',
    type: 'inputNumber',
  },
  {
    label: '总时长',
    prop: 'duration',
    type: 'inputNumber',
    addonAfter: '秒',
  },
  {
    label: '主角',
    prop: 'characters',
    type: 'input',
    width: 200,
  },
  {
    label: '剧本内容',
    prop: 'scriptContent',
    type: 'textArea',
    width: 300,
  },
]
export interface AudioConfig extends Omit<IConfig, 'prop'> {
  prop: keyof AudioChatParams
}
// 音频配置
export const AudioDesign: AudioConfig[] = [
  {
    label: '语言',
    prop: 'languagesName',
    type: 'select',
    width: 200,
    rules: [{ required: true, message: '不能为空' }],
  },
  {
    label: '声音',
    prop: 'shortName',
    type: 'select',
    rules: [{ required: true, message: '不能为空' }],
  },
  {
    label: '情感',
    prop: 'style',
    type: 'select',
    rules: [{ required: true, message: '不能为空' }],
  },

  {
    label: '声调',
    prop: 'pitch',
    type: 'select',
    rules: [{ required: true, message: '不能为空' }],
  },
  {
    label: '语速',
    prop: 'rate',
    type: 'select',
    rules: [{ required: true, message: '不能为空' }],
  },
]
export interface VideoConfig extends Omit<IConfig, 'prop'> {
  prop: keyof VideoChatParams
}
export const VideoDesign: VideoConfig[] = [
  {
    label: '背景运动',
    prop: 'conditionFactor',
    type: 'slider',
    width: 150,
    formatter: (value: number) => `${value / 100}`,
  },
  {
    label: '主体运动(0-300)',
    prop: 'motionBucketId',
    type: 'inputNumber',
    min: 0,
    max: 300,
    width: 150,
  },
  {
    label: '帧率',
    prop: 'fps',
    type: 'inputNumber',
    width: 100,
    addonAfter: '帧/秒',
    disabled: true,
  },

  {
    label: 'seed(18位整数)',
    prop: 'seed',
    type: 'inputNumber',
    width: 200,
  },
]

export interface ImageConfig extends Omit<IConfig, 'prop'> {
  prop: keyof ImageChatParams
}

export const ImageDesign: ImageConfig[] = [
  {
    label: '选项',
    prop: 'category',
    type: 'select',
    width: 200,
  },
  {
    label: '值',
    prop: 'btnValue',
    type: 'textArea',
    width: 200,
  },
]
