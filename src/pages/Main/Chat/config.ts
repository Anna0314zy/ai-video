import { projectTypes } from '@/pages/AIProject/config'
export type FieldType = {
  type?: string
  style?: string
  cameraCount?: number
  scriptLength?: number
  totalTime?: number
  hero?: string
  story?: string
}
export interface IConfig {
  label: string
  type: WidgetType
  options?: { label: string; value: string }[]
  addonAfter?: any
  prop: keyof FieldType
}

export type WidgetType = 'input' | 'inputNumber' | 'select'

//剧本配置
export const ScriptDesign: IConfig[] = [
  {
    label: '类型',
    prop: 'type',
    type: 'select',
    options: projectTypes.map(v => ({ label: v, value: v })),
  },
  {
    label: '风格',
    prop: 'style',
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
    prop: 'cameraCount',
    type: 'inputNumber',
  },
  {
    label: '脚本字数',
    prop: 'scriptLength',
    type: 'inputNumber',
  },
  {
    label: '总时长',
    prop: 'totalTime',
    type: 'inputNumber',
    addonAfter: '秒',
  },
  {
    label: '主角',
    prop: 'hero',
    type: 'input',
  },
  {
    label: '故事内容',
    prop: 'story',
    type: 'input',
  },
]
