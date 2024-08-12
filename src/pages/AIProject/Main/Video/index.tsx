import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'

export default () => {
  return (
    <Layout className={Styles['page-storyboard']}>
      <PageHeader icon='excel' status={<img src={confirm} width={68}></img>}>
        <Button>取消</Button>
        <Button type='primary'>打包导出</Button>
      </PageHeader>
      <Layout className='page-storyboard-content'>
        <StoryboardLayoutLeft />
        <StoryboardLayoutMain />
        <StoryboardLayoutRight />
      </Layout>
    </Layout>
  )
}
