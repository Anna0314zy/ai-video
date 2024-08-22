import { Fragment, useState, useRef, useMemo, useEffect } from 'react'
import { Layout, Modal, Button } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import CommonUpload, { IUploadOptions } from '@/components/CommonUpload'
import IconWidget from '@/components/IconWidget'
import { EnumUploadType, ResourceTypeMap, ResourceType } from '@/api/types/video'
// import { nickIcon } from '@/components/IconWidget/Icons'
import { downloadFromServer } from '@/utils'
import Result from '../Result'
import ResourceItem from '../ResourceItem'
import * as api from '@/api/models/aiVideo'
import Styles from './index.module.less'
import { Dispatch, RootState } from '@/store'
import { useParams } from 'react-router-dom'
interface IStoryboardVideo {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
  onChangeGetNewData: (pageIndex: number) => void
}

export default (props: IStoryboardVideo) => {
  const { data, onChangeGetNewData }: any = props
  const projectId = Number(useParams().id)
  const dispatch = useDispatch<Dispatch>()
  const scrollVideoRef = useRef(null)
  const { selectedImage, shotList, isShowResult, selectedVideo, currentSelectType, currentShotId, resourceList } =
    useSelector((state: RootState) => state.aiVideo)
  const { cdnPath } = useSelector((state: any) => state.common.pathConfig)
  const [videoDetail, setVideoDetail] = useState([])
  useScrollToBottomHook(scrollVideoRef, 1, () => {
    if (resourceList?.total / 10 <= resourceList?.current) return
    onChangeGetNewData(resourceList?.current + 1)
  })
  useEffect(() => {
    dispatch.aiVideo.updateData({
      isShowResult: false,
    })
  }, [currentShotId])
  const currentShot = useMemo(() => {
    return shotList.find(item => item.shotId === currentShotId)
  }, [currentShotId])

  useEffect(() => {
    // 如果在画面这里 则默认显示 video
    if (currentSelectType !== 'voice') {
      dispatch.aiVideo.updateData({
        currentSelectType: currentShot?.imageStatus === 'completed' ? 'video' : 'image',
      })
    }
  }, [currentShot])

  const setpData: {
    id: number
    name: string
    val: ResourceType
  }[] = [
    {
      id: 1,
      name: ResourceTypeMap['image'],
      val: 'image',
    },
    {
      id: 2,
      name: ResourceTypeMap['video'],
      val: 'video',
    },
  ]
  const onHandleJumpNextStep = async () => {
    // if (!Object.keys(currentSelect).length) return
    // setCurrentSelect(null)
    const target = resourceList.records?.find((v: any) => v.isFinal === 'final')
    await api.confirmResource({
      shotId: currentShotId,
      resourceId:
        (currentSelectType === 'image' ? selectedImage.resourceId : selectedVideo.resourceId) || target?.resourceId,
      type: currentSelectType,
    })
    if (currentSelectType === 'image') {
      dispatch.aiVideo.updateData({
        currentSelectType: 'video',
      })
    } else {
      const res = await api.getVideoDetail({ shotId: currentShotId })
      setVideoDetail(res)
      dispatch.aiVideo.updateData({
        isShowResult: !isShowResult,
      })
    }

    dispatch.aiVideo.getShotListByProjectId(projectId)
  }

  const onFinish = ({ uploadOptions }: { uploadOptions: IUploadOptions }) => {
    console.log('onFinish', uploadOptions, uploadOptions.cosFullPath)
    api
      .importResourceFile({ shotId: currentShotId, originPath: uploadOptions.cosFullPath, type: currentSelectType })
      .then(() => {
        onChangeGetNewData()
      })
  }
  const beforeUpload = () => {
    return Promise.resolve(true)
  }
  // onHandleDeleteResourceItem 删除某一项
  const onHandleDeleteResourceItem = (item: any) => {
    api.delResourceItem({ resourceId: item.resourceId, type: currentSelectType }).then(() => {
      onChangeGetNewData()
    })
    dispatch.aiVideo.deleteMessageByResourceId({
      resourceId: item.resourceId,
      type: item.type,
      shotId: currentShotId,
    })
  }

  const modalBox = (item: any) => {
    const destroy = () => {
      modalInstance.destroy()
      // modalInstance = null
    }

    const modalInstance = Modal.warning({
      title: `${ResourceTypeMap[currentSelectType]}预览`,
      closeIcon: true,
      icon: null,
      width: 1080,
      height: 679,
      content: (
        <div>
          {currentSelectType === 'image' ? (
            <img style={{ width: 1000 }} className='preview-img' src={`${cdnPath}${item.compressUrl}`} alt='' />
          ) : (
            <video controls style={{ width: 1000 }}>
              <source src={cdnPath + item.compressUrl} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ),
      footer: (
        <div style={{ float: 'right' }}>
          <Button
            key={'cancel'}
            onClick={() => {
              destroy()
            }}>
            取消
          </Button>
          <Button
            key={'del'}
            onClick={() => {
              onHandleDeleteResourceItem(item)
              dispatch.aiVideo.deleteMessageByResourceId({
                resourceId: item.resourceId,
                type: item.type,
                shotId: currentShotId,
              })
              destroy()
            }}>
            删除
          </Button>
          <Button
            type={'primary'}
            onClick={() => {
              downloadFromServer(
                cdnPath +
                  item.compressUrl +
                  `?id=${item.resourceId}&fileName=${item.name}
                &ext=${currentSelectType === 'image' ? 'png' : 'mp4'}`,
                `${item.name}.${currentSelectType === 'image' ? 'png' : 'mp4'}`,
              )
            }}>
            下载
          </Button>
        </div>
      ),
    })
  }
  const onChangeActive = (item: any) => {
    return (
      item.resourceId === (currentSelectType === 'image' ? selectedImage : selectedVideo)['resourceId'] ||
      item.isFinal === 'final'
    )
  }
  return (
    <Layout className={Styles['storyboard-image']}>
      <Layout.Sider className='storyboard-image-step'>
        {setpData.map((item, index) => (
          <Fragment key={index}>
            {/* <div> */}
            <button
              className='btn-step'
              data-actived={currentSelectType === item.val}
              onClick={async () => {
                if (currentShot?.imageStatus !== 'completed' && item.val === 'video') return
                dispatch.aiVideo.updateData({ currentSelectType: item.val })
              }}>
              <div className='btn-step-index f-center'>{item.id}</div>
              {/* Object.keys(selectedImage).length ? nickIcon() :  */}
              <div className='btn-s ep-text'>{item.name}</div>
            </button>

            {setpData.length - 1 !== index && <div className='step-divider'></div>}
          </Fragment>
        ))}
      </Layout.Sider>
      <Layout.Content className='storyboard-image-content'>
        {!isShowResult && (
          <div className='storyboard-image-content__header'>
            <span>{ResourceTypeMap[currentSelectType]}资源</span>
            <CommonUpload beforeUpload={beforeUpload} onFinish={onFinish} type={currentSelectType}>
              <span>导入{ResourceTypeMap[currentSelectType]}</span>
            </CommonUpload>
          </div>
        )}

        {isShowResult ? (
          Object.keys(videoDetail || {}).length > 0 && <Result data={videoDetail} type={'video'} />
        ) : (
          <div ref={scrollVideoRef} className='storyboard-image-content__list'>
            {!data.length ? (
              <div className='empty-box'>
                <IconWidget name='empty' />
                <p>空空如也，快去创作{ResourceTypeMap[currentSelectType]}吧～</p>
              </div>
            ) : (
              data.map((item: any, index: number) => (
                <ResourceItem
                  key={index}
                  data={item}
                  cdnPath={cdnPath}
                  ext={currentSelectType === 'image' ? 'png' : 'mp4'}
                  onHandlePreviewResourceItem={() => {
                    modalBox(item)
                  }}
                  onHandleDeleteResourceItem={() => {
                    onHandleDeleteResourceItem(item)
                    // 删除某个资源
                  }}
                  onClick={() => {
                    console.log('%c 🚀 ~ [  ]-86', 'font-size:14px; background:green; color:#fff;', item)
                    // setCurrentSelect(item)
                    dispatch.aiVideo.updateData({
                      [currentSelectType === 'image' ? 'selectedImage' : 'selectedVideo']: item,
                    })
                  }}
                  actived={onChangeActive(item)}
                />
              ))
            )}
          </div>
        )}
        <div
          className={`storyboard-image-content__btn ${isShowResult ? 'edit-btn' : 'un'}`}
          onClick={() => onHandleJumpNextStep()}>
          <span>{isShowResult ? '重新编辑' : currentSelectType === 'image' ? '确认并开始视频设计' : '确认视频'}</span>
        </div>
      </Layout.Content>
    </Layout>
  )
}
