import { FC, useState } from 'react'
import { Layout } from 'antd'
import FrameItem from './modules/FrameItem'
import './index.less'
const StoryboardLayoutLeft: FC<any> = () => {
  const [currentSelectIndex, setCurrentSelectIndex] = useState(0)
  const list = new Array(20).fill(0)
  return (
    <Layout.Sider className='page-storyboard-left'>
      <div className='page-storyboard-left__header'>
        <span>共32个镜头</span>
        <span>新建镜头</span>
      </div>
      <div className='page-storyboard-left__list'>
        {list.map((item, index) => (
          <FrameItem
            onClick={() => setCurrentSelectIndex(index)}
            key={index}
            index={index + 1}
            img={'http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960'}
            active={index === currentSelectIndex}
          />
        ))}
      </div>
    </Layout.Sider>
  )
}
export default StoryboardLayoutLeft
