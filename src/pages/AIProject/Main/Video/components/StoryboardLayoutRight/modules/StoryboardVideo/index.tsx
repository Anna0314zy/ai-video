import { Fragment, useState, useRef, useEffect } from 'react'
import { Layout, message } from 'antd'
import Styles from './index.module.less'
import MaterialItem from '@/pages/AIProject/components/MaterialItem'
import { fileIcon, downIcon, moreIcon } from '@/components/IconWidget/Icons'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import Result from '../Result'
import ResourceItem from '../ResourceItem'
import { useSelector, useDispatch } from 'react-redux'

interface IStoryboardVideo {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
  onChangeGetNewData: () => void
}

export default (props: IStoryboardVideo) => {
  const { data, onChangeGetNewData }: any = props
  const dispatch = useDispatch()
  const [step, setStep]: any = useState(props.step || 1)
  const [imgData, setImgData] = useState(data)
  const [videoData, setVideoData] = useState(data)
  const { selectedImage, selectedVideo } = useSelector((state: any) => state.aiVideo)
  const [isShowResult, setIsShowResult] = useState(false)
  const scrollContainerRef = useRef(null)

  useScrollToBottomHook(scrollContainerRef, 50, () => {
    onChangeGetNewData()
    console.log('%c 🚀 ~ [  ]-29', 'font-size:14px; background:green; color:#fff;', '到底部')
  })

  const setpData = [
    {
      id: 1,
      name: '图片',
    },
    {
      id: 2,
      name: '视频',
    },
  ]
  const onHandleJumpNextStep = () => {
    if (step === 1 && Object.keys(selectedImage).length) {
      dispatch.aiVideo.updateData({ currentSelectType: 'video' })
      setStep((preData: any) => {
        return preData + 1
      })
    }
    if (step === 2 && !isShowResult && Object.keys(selectedVideo).length) {
      setIsShowResult(true)
    } else {
      setIsShowResult(false)
    }
  }
  return (
    <Layout className={Styles['storyboard-image']}>
      <Layout.Sider className='storyboard-image-step'>
        {setpData.map((item, index) => (
          <Fragment key={index}>
            <button
              className='btn-step'
              data-actived={step === index + 1}
              onClick={() => {
                // setStep(item.id)
              }}>
              <div className='btn-step-index'>{item.id}</div>
              <div className='btn-step-text'>{item.name}</div>
            </button>
            {setpData.length - 1 !== index && <div className='step-divider'></div>}
          </Fragment>
        ))}
      </Layout.Sider>
      <Layout.Content className='storyboard-image-content'>
        {!isShowResult && (
          <div className='storyboard-image-content__header'>
            <span>{step === 1 ? '图片' : '视频'}资源</span>
            <span>导入{step === 1 ? '图片' : '视频'}</span>
          </div>
        )}
        {isShowResult ? (
          <Result />
        ) : (
          <div ref={scrollContainerRef} className='storyboard-image-content__list'>
            {data.map((item: any, index: number) => (
              <ResourceItem
                key={index}
                data={item}
                onHandleDeleteResourceItem={() => {
                  // 删除某个资源
                }}
                onClick={() => {
                  console.log('%c 🚀 ~ [  ]-86', 'font-size:14px; background:green; color:#fff;', item)
                  dispatch.aiVideo.updateData({ [step === 1 ? 'selectedImage' : 'selectedVideo']: item })
                }}
                actived={item.resourceId === (step === 1 ? selectedImage : selectedVideo)['resourceId']}
              />
            ))}
          </div>
        )}
        <div
          className={`storyboard-image-content__btn ${isShowResult ? 'edit-btn' : 'un'}`}
          onClick={() => onHandleJumpNextStep()}>
          <span>{isShowResult ? '重新编辑' : step === 1 ? '确认并开始视频设计' : '确认视频'}</span>
        </div>
      </Layout.Content>
    </Layout>
  )
}
