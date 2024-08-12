import { Layout } from 'antd'
import StoryboardCard from '../StoryboardCard'

export default () => {
    const list = new Array(20).fill(0)
    return <Layout.Sider className='page-storyboard-left'>
        {
            list.map((item,index)=> <StoryboardCard index={index+1} img={'http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960'} actived={index===0}/>)
        }
        
    </Layout.Sider>
}