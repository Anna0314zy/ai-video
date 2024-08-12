import { Layout } from 'antd'
import StoryboardCard from '../StoryboardCard'
import ContentMenu from '../ContentMenu'
import DragList from './DragList'
export default () => {
  const list = new Array(20).fill(0).map((v, idx) => ({
    ...v,
    id: idx + 1,
  }))
  return (
    <Layout.Sider className='page-storyboard-left'>
      <ContentMenu>
        <DragList />
      </ContentMenu>
    </Layout.Sider>
  )
}
