import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import CommonUpload from '@/components/CommonUpload'
import { createContext, useState } from 'react'
import { ShotList } from '@/api/type'
interface Context {
  // projectId: number
  // sessionId: number
  list: ShotList[]
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
export default () => {
  const [list, setList] = useState(
    [
      {
        id: 'gary',
        name: 'Gary Goodspeed',
        thumb: '/images/gary.png',
      },
      {
        id: 'cato',
        name: 'Little Cato',
        thumb: '/images/cato.png',
      },
      {
        id: 'kvn',
        name: 'KVN',
        thumb: '/images/kvn.png',
      },
      {
        id: 'mooncake',
        name: 'Mooncake',
        thumb: '/images/mooncake.png',
      },
      {
        id: 'quinn',
        name: 'Quinn Ergon',
        thumb: '/images/quinn.png',
      },
    ].map((v, idx) => ({
      ...v,
      sortIndex: idx + 1,
      url: 'http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960',
    })),
  )
  const onFinish = (options: any) => {
    console.log('zy onFinish', options)
  }
  // 选中的id
  const [curId, setCurId] = useState('gary')
  const contextValue = {
    list,
    setList,
    curId,
    setCurId,
  }
  return (
    <MyContext.Provider value={contextValue}>
      <Layout className={Styles['page-storyboard']}>
        <PageHeader icon='excel' status={<img src={confirm} width={68}></img>}>
          <CommonUpload onFinish={onFinish} />

          <Button type='primary'>打包导出</Button>
        </PageHeader>
        <Layout className='page-storyboard-content'>
          <StoryboardLayoutLeft />
          <StoryboardLayoutMain />
          <StoryboardLayoutRight />
        </Layout>
      </Layout>
    </MyContext.Provider>
  )
}
