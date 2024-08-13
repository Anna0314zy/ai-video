import { Input, InputNumber, Select, Slider } from 'antd'
import { IConfig, AudioConfig, VideoConfig, ImageConfig } from './config'
interface IProps {
  data: IConfig | AudioConfig | VideoConfig | ImageConfig
  onChange?: (val: any) => void
  value?: any
  disabled?: boolean
}
export function WidgetItem({ data, onChange, value, disabled }: IProps) {
  const { type, options, addonAfter, min, max, formatter } = data

  switch (type) {
    case 'select':
      return <Select style={{ width: data.width || '120px' }} disabled={disabled} options={options} />
    case 'input':
      return <Input style={{ width: data.width || '120px' }} disabled={disabled || data.disabled} />
    case 'textArea':
      return <Input.TextArea disabled={disabled} style={{ width: data.width || '120px' }} />
    case 'inputNumber':
      return (
        <InputNumber
          style={{ width: data.width || '120px' }}
          controls={false}
          disabled={disabled || data.disabled}
          addonAfter={addonAfter}
          min={min}
          max={max}
        />
      )
    case 'slider':
      return <Slider tooltip={{ formatter }} style={{ width: data.width || '120px' }} min={min} max={max} />
    default:
      return null
  }
}
