import { projectTypes } from '@/pages/AIProject/config'
import { ScriptPrompt } from '@/api/type'

export interface IConfig {
  label: string
  type: WidgetType
  options?: { label: string; value: string }[]
  addonAfter?: any
  prop: keyof ScriptPrompt
}

export type WidgetType = 'input' | 'inputNumber' | 'select'

//剧本配置
export const ScriptDesign: IConfig[] = [
  {
    label: '类型',
    prop: 'scriptType',
    type: 'select',
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
  },
  {
    label: '剧本主题',
    prop: 'scriptTitle',
    type: 'input',
  },
]
