import { Divider, Layout, Tabs } from 'antd'
import Styles from './index.module.less'
import StoryboardScreen from '../StoryboardScreen'
import StoryboardAudio from '../StoryboardAudio'

export default () => {
  return (
    <Layout.Sider className='page-storyboard-right'>
      <Tabs
        className={Styles['storyboard-tab']}
        defaultActiveKey='image'
        centered
        items={[
          {
            label: <div>画面</div>,
            key: 'image',
            children: <StoryboardScreen />,
          },
          {
            label: <div>旁白</div>,
            key: 'audio',
            children: <StoryboardAudio />,
          },
        ]}
      />
    </Layout.Sider>
  )
}
