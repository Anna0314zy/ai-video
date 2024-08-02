import HeaderLayout from '../HeaderLayout'
import { CheckCircleOutlined } from '@ant-design/icons'
import IconWidget from '@/components/IconWidget'
import { Tag, Button } from 'antd'
import Styles from '../index.module.less'
import { DesignType, IData } from '../type'
// 根据 enum 值获取文本内容的函数
function getDesignTypeText(value: DesignType): string {
  if (value === 1) return '剧本设计'
  else return '镜头设计'
}

const leftChildren = (props: IData) => {
  return (
    <>
      <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }} />
      <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《{props?.name}》</span>
      <span className={Styles['tip-shu']}> | </span>
      <span className={Styles['tip-text']}> {getDesignTypeText(props?.type)}</span>
      <Tag style={{ width: 68, marginLeft: 12 }} icon={<CheckCircleOutlined />} color='success'>
        已确认
      </Tag>
    </>
  )
}

const rightChildren = (props: IData) => {
  return (
    <>
      <Button>跳过</Button>
      <Button type='primary'>下一步</Button>
    </>
  )
}

export default ({ data }: { data: IData }) => {
  return <HeaderLayout leftChildren={() => leftChildren(data)} rightChildren={() => rightChildren(data)} />
}
