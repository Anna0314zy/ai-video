import HeaderLayout from '../../../components/HeaderLayout'
import { Button } from 'antd'
import { ProjectList } from '@/api/models/project'
import { useNavigate } from 'react-router-dom'
import LeftHeader from '../../../components/HeaderLayout/LeftHeader'
const rightChildren = (project: ProjectList) => {
  const navigate = useNavigate()
  const onClick = () => {
    console.log()
    navigate(`/project/${project.id}/video`)
  }

  return (
    <>
      <Button onClick={onClick}>跳过</Button>
      <Button type='primary' onClick={onClick} disabled={project.state === 'VideoProcessing'}>
        下一步
      </Button>
    </>
  )
}

export default () => {
  return <HeaderLayout leftChildren={LeftHeader} rightChildren={rightChildren} showHeaderTips={true} />
}
