import { Input, InputNumber, Select } from 'antd'
import { IConfig } from '../config'
interface IProps {
  data: IConfig
  onChange?: (val: any) => void
  value?: any
  disabled?: boolean
}
export function WidgetItem({ data, onChange, value, disabled }: IProps) {
  const { type, options, addonAfter } = data

  switch (type) {
    case 'select':
      return <Select style={{ width: 108 }} disabled={disabled} options={options} />
    case 'input':
      return <Input disabled={disabled} />
    case 'inputNumber':
      return <InputNumber controls={false} disabled={disabled} addonAfter={addonAfter} />
    default:
      return null
  }
}
