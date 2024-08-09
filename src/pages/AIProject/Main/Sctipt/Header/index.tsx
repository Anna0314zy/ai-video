import HeaderLayout from '../HeaderLayout'
import IconWidget from '@/components/IconWidget'
import { Button } from 'antd'
import Styles from '../index.module.less'
import { getHeaderTips } from '@/api/type'
import { MyContext } from '../index'
import { useContext } from 'react'

const leftChildren = () => {
  const { projectName, state, disabled } = useContext(MyContext)
  return (
    <>
      <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }} />
      <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《{projectName}》</span>
      <span className={Styles['tip-shu']}> | </span>
      <span className={Styles['tip-text']}> {getHeaderTips(state)}</span>
      {/* <Tag style={{ width: 68, marginLeft: 12 }} icon={<CheckCircleOutlined />} color='success'>
        已确认
      </Tag> */}
    </>
  )
}

const rightChildren = () => {
  const { disabled } = useContext(MyContext)
  return (
    <>
      <Button>跳过</Button>
      <Button type='primary' disabled={!disabled}>
        下一步
      </Button>
    </>
  )
}

export default () => {
  return <HeaderLayout leftChildren={leftChildren} rightChildren={rightChildren} />
}
