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
  maxLength?: number
  formatter?: any
  disabled?: boolean
  rules?: Rule[]
  required?: boolean
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
    required: true,
    rules: [
      {
        required: false, // 允许空字符串
        validator: (_, value) => {
          if (value === undefined) {
            return Promise.reject(new Error('不能为空'))
          }
          return Promise.resolve()
        },
      },
    ],
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
export const AudioChineseComp = [
  {
    label: '语言',
    prop: 'language',
  },
  {
    label: '声音',
    prop: 'shortNameTranslated',
  },
  {
    label: '情感',
    prop: 'styleTranslated',
  },

  {
    label: '声调',
    prop: 'pitch',
  },
  {
    label: '语速',
    prop: 'rate',
  },
]

export interface VideoConfig extends Omit<IConfig, 'prop'> {
  prop: keyof VideoChatParams
}

export const VideoDesign: VideoConfig[] = [
  {
    label: '视频运动提示词',
    prop: 'prompt',
    type: 'textArea',
    width: 420,
    maxLength: 500,
  },
  {
    label: '镜头运动',
    prop: 'cameraMovement',
    type: 'select',
    width: 140,
    options: [
      { label: '镜头固定', value: '镜头固定' },
      { label: '缓慢推进', value: '缓慢推进' },
      { label: '缓慢拉远', value: '缓慢拉远' },
      { label: '横向跟拍', value: '横向跟拍' },
      { label: '轻微环绕', value: '轻微环绕' },
      { label: '轻微手持', value: '轻微手持' },
    ],
  },
  {
    label: '运动强度',
    prop: 'motionStrength',
    type: 'select',
    width: 120,
    options: [
      { label: '轻微', value: '轻微' },
      { label: '中等', value: '中等' },
      { label: '强烈', value: '强烈' },
    ],
  },
  {
    label: '时长',
    prop: 'duration',
    type: 'inputNumber',
    width: 120,
    min: 3,
    max: 10,
    addonAfter: '秒',
  },
  {
    label: '画幅比例',
    prop: 'ratio',
    type: 'select',
    width: 130,
    options: [
      { label: '横屏 16:9', value: '16:9' },
      { label: '竖屏 9:16', value: '9:16' },
      { label: '方形 1:1', value: '1:1' },
    ],
  },
]

export interface ImageConfig extends Omit<IConfig, 'prop'> {
  prop: keyof ImageChatParams
}

export const ImageDesign: ImageConfig[] = [
  {
    label: '画面主体',
    prop: 'subject',
    type: 'input',
    width: 220,
    maxLength: 120,
  },
  {
    label: '构图/镜头',
    prop: 'composition',
    type: 'select',
    width: 140,
    options: [
      { label: '全景', value: '全景' },
      { label: '中景', value: '中景' },
      { label: '近景', value: '近景' },
      { label: '特写', value: '特写' },
      { label: '俯拍', value: '俯拍' },
      { label: '仰拍', value: '仰拍' },
    ],
  },
  {
    label: '风格',
    prop: 'style',
    type: 'select',
    width: 150,
    options: [
      { label: '写实电影感', value: '写实电影感' },
      { label: '动画电影', value: '动画电影' },
      { label: '国风插画', value: '国风插画' },
      { label: '水彩', value: '水彩' },
      { label: '赛博朋克', value: '赛博朋克' },
      { label: '3D卡通', value: '3D卡通' },
    ],
  },
  {
    label: '光线/氛围',
    prop: 'lighting',
    type: 'select',
    width: 150,
    options: [
      { label: '明亮自然光', value: '明亮自然光' },
      { label: '黄昏逆光', value: '黄昏逆光' },
      { label: '夜晚霓虹', value: '夜晚霓虹' },
      { label: '柔和暖光', value: '柔和暖光' },
      { label: '阴天冷调', value: '阴天冷调' },
      { label: '戏剧化光影', value: '戏剧化光影' },
    ],
  },
  {
    label: '画幅比例',
    prop: 'aspectRatio',
    type: 'select',
    width: 130,
    options: [
      { label: '横屏视频 16:9', value: '16:9' },
      { label: '竖屏短视频 9:16', value: '9:16' },
      { label: '方图 1:1', value: '1:1' },
      { label: '宽电影感 21:9', value: '21:9' },
    ],
  },
  {
    label: '质量',
    prop: 'quality',
    type: 'select',
    width: 120,
    options: [
      { label: '标准', value: '标准' },
      { label: '高清', value: '高清' },
      { label: '精细', value: '精细' },
    ],
  },
  {
    label: '色彩倾向',
    prop: 'colorTone',
    type: 'select',
    width: 130,
    options: [
      { label: '自然', value: '自然' },
      { label: '暖色', value: '暖色' },
      { label: '冷色', value: '冷色' },
      { label: '高饱和', value: '高饱和' },
      { label: '低饱和', value: '低饱和' },
    ],
  },
  {
    label: '人物一致性',
    prop: 'characterConsistency',
    type: 'input',
    width: 220,
    maxLength: 120,
  },
  {
    label: '负向提示',
    prop: 'negativePrompt',
    type: 'input',
    width: 260,
    maxLength: 160,
  },
  {
    label: '最终中文提示词',
    prop: 'btnValue',
    type: 'textArea',
    width: 420,
    maxLength: 800,
  },
]
