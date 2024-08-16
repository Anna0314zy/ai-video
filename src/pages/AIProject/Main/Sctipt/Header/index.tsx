import HeaderLayout from '../../../components/HeaderLayout'
import IconWidget from '@/components/IconWidget'
import { Button, Tag } from 'antd'
import Styles from '../index.module.less'
import { getHeaderTips } from '@/api/types/script'
import { MyContext } from '../MyContext'
import { useContext } from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'

const leftChildren = () => {
  const { projectName, currentState, disabled } = useContext(MyContext)
  console.log('currentState', currentState)
  const step = location.hash.split('/').pop()
  return (
    <>
      <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }} />
      <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>{projectName}</span>
      <span className={Styles['tip-shu']}> | </span>
      <span className={Styles['tip-text']}> {getHeaderTips(step)}</span>
      {currentState !== 'ScriptProcessing' ? (
        <Tag style={{ width: 68, marginLeft: 12 }} icon={<CheckCircleOutlined />} color='success'>
          已确认
        </Tag>
      ) : null}
    </>
  )
}

const rightChildren = () => {
  const { disabled } = useContext(MyContext)

  // const handleClick
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
