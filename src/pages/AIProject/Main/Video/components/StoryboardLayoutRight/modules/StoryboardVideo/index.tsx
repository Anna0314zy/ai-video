import { Fragment, useState, useRef, useEffect } from 'react'
import { Layout } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import IconWidget from '@/components/IconWidget'
import Result from '../Result'
import ResourceItem from '../ResourceItem'
import * as api from '@/api/models/video'
import Styles from './index.module.less'

interface IStoryboardVideo {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
  onChangeGetNewData: () => void
}

export default (props: IStoryboardVideo) => {
  const { data, onChangeGetNewData }: any = props
  const dispatch = useDispatch()
  const scrollVideoRef = useRef(null)

  const [step, setStep]: any = useState(props.step || 1)
  const { selectedImage, selectedVideo, currentSelectType, currentShotId } = useSelector((state: any) => state.aiVideo)
  const [isShowResult, setIsShowResult] = useState(false)
  const [videoDetail, setVideoDetail] = useState([])

  useScrollToBottomHook(scrollVideoRef, 1, () => {
    onChangeGetNewData()
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
      api.confirmResource({ shotId: currentShotId, resourceId: selectedImage.resourceId, type: currentSelectType })
      setStep((preData: any) => {
        return preData + 1
      })
    }
    if (step === 2 && !isShowResult && Object.keys(selectedVideo).length) {
      api
        .confirmResource({ shotId: currentShotId, resourceId: selectedVideo.resourceId, type: currentSelectType })
        .then(async () => {
          const res = await api.getVideoDetail({ shotId: currentShotId })
          setVideoDetail(res)
        })

      setIsShowResult(true)
    } else {
      setIsShowResult(false)
    }
  }
  const onHandleAddResource = () => {
    // 导入资源
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
            <span
              onClick={() => {
                onHandleAddResource()
              }}>
              导入{step === 1 ? '图片' : '视频'}
            </span>
          </div>
        )}

        {isShowResult ? (
          Object.keys(videoDetail).length && <Result data={videoDetail} type={'video'} />
        ) : (
          <div ref={scrollVideoRef} className='storyboard-image-content__list'>
            {!data.length ? (
              <div className='empty-box'>
                <IconWidget name='empty' />
                <p>空空如也，快去创作{step === 1 ? '图片' : '视频'}吧～</p>
              </div>
            ) : (
              data.map((item: any, index: number) => (
                <ResourceItem
                  key={index}
                  data={item}
                  onHandlePreviewResourceItem={() => {
                    // 预览
                  }}
                  onHandleDeleteResourceItem={() => {
                    api.delResourceItem({ resourceId: item.resourceId, type: currentSelectType }).then(() => {
                      onChangeGetNewData()
                    })
                    // 删除某个资源
                  }}
                  onClick={() => {
                    console.log('%c 🚀 ~ [  ]-86', 'font-size:14px; background:green; color:#fff;', item)
                    dispatch.aiVideo.updateData({ [step === 1 ? 'selectedImage' : 'selectedVideo']: item })
                  }}
                  actived={item.resourceId === (step === 1 ? selectedImage : selectedVideo)['resourceId']}
                />
              ))
            )}
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
