import { Divider, Layout, Tabs } from 'antd'
import Styles from './index.module.less'
import StoryboardScreen from './modules/StoryboardScreen'
import StoryboardAudio from './modules/StoryboardAudio'

const data = [
  {
    projectId: 29,
    scriptId: 61,
    source: 2,
    name: 'JB01-test11',
    shotNum: 3,
    wordNum: 100,
    duration: 120,
    characters: '',
    scriptType: '古诗AI短视频',
    scriptStyle: '',
    scriptContent: '',
    isFinal: 0,
    modified: '2024-08-12 14:34:44',
  },
  {
    projectId: 29,
    scriptId: 62,
    source: 2,
    name: 'JB01-test11',
    shotNum: 3,
    wordNum: 100,
    duration: 120,
    characters: '',
    scriptType: '古诗AI短视频',
    scriptStyle: '',
    scriptContent: '',
    isFinal: 0,
    modified: '2024-08-12 14:34:49',
  },
  {
    projectId: 29,
    scriptId: 63,
    source: 2,
    name: 'JB01-test11',
    shotNum: 3,
    wordNum: 100,
    duration: 120,
    characters: '',
    scriptType: '古诗AI短视频',
    scriptStyle: '',
    scriptContent: '',
    isFinal: 0,
    modified: '2024-08-12 14:35:25',
  },
]

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
            children: <StoryboardScreen data={data} />,
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
