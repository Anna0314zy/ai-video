import { Input, InputNumber, Select, Flex, Form } from 'antd'
import { IConfig, FieldType } from './config'
export function WidgetItem({ data, value, disabled }: { data: IConfig; value?: any; disabled?: boolean }) {
  const { type, options, addonAfter } = data
  console.log('type', type)

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
