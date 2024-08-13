import { Layout, Button } from 'antd'
import PageHeader from '@/components/PageHeader'
import confirm from '@/assets/images/img_confirm.png'
import StoryboardLayoutLeft from './components/StoryboardLayoutLeft'
import StoryboardLayoutRight from './components/StoryboardLayoutRight'
import StoryboardLayoutMain from './components/StoryboardLayoutMain'
import Styles from './index.module.less'
import CommonUpload from '@/components/CommonUpload'
import { createContext, useEffect, useMemo, useState, useRef } from 'react'
import { ShotList } from '@/api/types/video'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
import * as api from '@/api/models/video'
import StompSocket from '@/utils/stompSocket'
import { SEND_THOROUGH, TEXT_TO_IMAGE_THOROUGH } from '@/const/socket'
type SelectType = 'pic' | 'video' | 'voice'
interface Context {
  // projectId: number
  // sessionId: number
  list: ShotList[]
  curShot?: ShotList
  selectedType: SelectType
  [k: string]: any
}
export const MyContext = createContext<Context>({} as Context)
export default () => {
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)
  const { id } = useParams() // 获取路由参数 userId
  const dispatch = useDispatch<Dispatch>()
  // 当前选中的是图片 视频 还是音频
  const [selectedType, setSelectedType] = useState<SelectType>('pic')
  const [list, setList] = useState<ShotList[]>([])
  const onFinish = (options: any) => {
    console.log('zy onFinish', options)
  }
  // 选中的id
  const [curId, setCurId] = useState<number>()

  const curShot = useMemo(() => {
    return list?.find(v => v.shotId === curId)
  }, [list, curId])
  const getShotListByProjectId = async () => {
    const { shotBaseInfoList } = await api.getShotListByProjectId(Number(id))
    setList(shotBaseInfoList || [])
    setCurId(shotBaseInfoList[0].shotId)
  }
  useEffect(() => {
    dispatch.common.getPathConfig()
    dispatch.auth.getUserInfo()
    getShotListByProjectId()
  }, [])
  const contextValue = {
    list,
    setList,
    curId,
    setCurId,
    curShot,
    selectedType,
    setSelectedType,
    projectId: Number(id),
  }
  let stompSocket = useRef<any>(null)
  useEffect(() => {
    if (!accountId) return
    stompSocket.current = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: SEND_THOROUGH,
      subscribeThorough: `${TEXT_TO_IMAGE_THOROUGH}/${accountId}`,
    })
    stompSocket.current.on('onSubscribe', (message: any) => {
      console.log('onSubscribe', message, JSON.parse(message.body))
    })
  }, [accountId])

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
