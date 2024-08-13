import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import CommonUpload from '@/components/CommonUpload'
import { createContext, useEffect, useMemo, useState } from 'react'
import { ShotList } from '@/api/types/video'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'

interface Context {
  // projectId: number
  // sessionId: number
  list: ShotList[]
  curShot?: ShotList
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
export default () => {
  const dispatch = useDispatch<Dispatch>()
  // 当前选中的是图片 视频 还是音频
  const [selectedType, setSelectedType] = useState<'pic' | 'video' | 'voice'>('pic')
  const [list, setList] = useState<ShotList[]>([
    {
      shotId: 67,
      narration: '',
      status: 'uncompleted',
      sort: 1,
    },
  ])
  const onFinish = (options: any) => {
    console.log('zy onFinish', options)
  }
  // 选中的id
  const [curId, setCurId] = useState(67)

  const curShot = useMemo(() => {
    return list.find(v => v.shotId === curId)
  }, [list])

  useEffect(() => {
    dispatch.common.getPathConfig()
    dispatch.auth.getUserInfo()
  }, [])
  const contextValue = {
    list,
    setList,
    curId,
    setCurId,
    curShot,
    selectedType,
    setSelectedType,
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
