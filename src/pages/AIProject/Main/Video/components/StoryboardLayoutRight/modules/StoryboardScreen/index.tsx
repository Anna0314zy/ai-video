import { Fragment, useState, useRef, useEffect } from 'react'
import { Layout, message } from 'antd'
import Styles from './index.module.less'
// import MaterialItem from '@/pages/AIProject/components/MaterialItem'
import { fileIcon, downIcon, moreIcon } from '@/components/IconWidget/Icons'
import { useSelector, useDispatch } from 'react-redux'

interface IStoryboardScreen {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
}

export default (props: IStoryboardScreen) => {
  const { data } = props
  const dispatch = useDispatch()
  const [step, setStep]: any = useState(props.step || 1)
  const [imgData, setImgData] = useState(data)
  const [videoData, setVideoData] = useState(data)
  const { selectedImage, selectedVideo } = useSelector((state: any) => state.aiVideo)
  const [isScrollBottom, setIsScrollBottom] = useState(false)
  const scrollContainerRef = useRef(null)
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current
      setIsScrollBottom(scrollHeight - scrollTop - clientHeight <= 100)
    }
  }
  useEffect(() => {
    const container: any = scrollContainerRef.current
    container.addEventListener('scroll', handleScroll)

    console.log('%c 🚀 ~ [  ]-32', 'font-size:14px; background:green; color:#fff;', isScrollBottom)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [isScrollBottom])
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
    if (!Object.keys(step === 1 ? selectedImage : selectedVideo).length) return message.warning('选择一个')
    if (step === 1) {
      setStep((preData: any) => {
        return preData + 1
      })
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
        <div className='storyboard-image-content__header'>
          <span>{step === 1 ? '图片' : '视频'}资源</span>
          <span>导入{step === 1 ? '图片' : '视频'}</span>
        </div>
        <div ref={scrollContainerRef} className='storyboard-image-content__list'>
          {[...(step === 1 ? imgData : videoData)].map((item: any, index: number) => (
            // <MaterialItem
            //   key={index}
            //   data={item}
            //   onChange={() => {
            //     dispatch.aiVideo.updateData({ selectedImage: item })
            //   }}
            //   actived={item.scriptId === (step === 1 ? selectedImage : selectedVideo)['scriptId']}
            // />
            <div className='file-item'>
              <div className='file-item__icon f-center'>{fileIcon()}</div>
              <div className='file-item__content '>
                <span className='one-line-ellipsis'>SC01-P01《高尔基与童年》</span>
                <span>2024.08.20 13:20:55</span>
              </div>
              <div className='file-item__operation'>
                <span>{downIcon()}</span>
                <span>{moreIcon()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className='storyboard-image-content__btn' onClick={() => onHandleJumpNextStep()}>
          <span>{step === 1 ? '确认并开始视频设计' : '确认视频'}</span>
        </div>
        {/* {step === 1 && <StoryboardImage />} */}
        {/* {step === 2 && <StoryboardVideo />} */}
      </Layout.Content>
    </Layout>
  )
}
