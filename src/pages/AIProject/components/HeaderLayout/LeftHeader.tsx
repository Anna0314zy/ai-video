import IconWidget from '@/components/IconWidget'
import { Tag } from 'antd'
import { getHeaderTips } from '@/api/types/script'
import { CheckCircleOutlined } from '@ant-design/icons'
import { getQueryParam } from '@/utils'
import { ProjectList } from '@/api/models/project'
import Styles from './index.module.less'
const leftChildren = (project: ProjectList, showHeaderTips = false) => {
  const projectName = getQueryParam('projectName')
  const step = location.hash.split('/').pop()
  return (
    <>
      <IconWidget name='excel' style={{ width: 22, marginLeft: 12 }} />
      <span style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>{projectName}</span>
      <span className={Styles['tip-shu']}> | </span>
      <span className={Styles['tip-text']}> {getHeaderTips(step)}</span>
      {showHeaderTips && project.state && project.state !== 'ScriptProcessing' ? (
        <Tag style={{ width: 68, marginLeft: 12 }} icon={<CheckCircleOutlined />} color='success'>
          已确认
        </Tag>
      ) : null}
    </>
  )
}
export default leftChildren
