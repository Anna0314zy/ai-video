import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Modal, Button } from 'antd'
import { useParams } from 'react-router-dom'
import { cloneDeep } from 'lodash-es'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import ResourceItem from '../ResourceItem'
import { downloadFromServer } from '@/utils'
import IconWidget from '@/components/IconWidget'

import { EnumUploadType } from '@/api/types/video'
import CommonUpload, { IUploadOptions } from '@/components/CommonUpload'
import Result from '../Result'
import * as api from '@/api/models/aiVideo'
import './index.less'
import { Dispatch, RootState } from '@/store'
const { TextArea } = Input

export default (props: any) => {
  const { data, onChangeGetNewData } = props
  const dispatch = useDispatch<Dispatch>()
  const scrollAudioRef = useRef(null)
  const { id } = useParams() // 获取路由参数 userId
  const { shotList, selectedAudio, currentShotId, selectedVoice, currentSelectType, selectedShot } = useSelector(
    (state: RootState) => state.aiVideo,
  )
  const { cdnPath } = useSelector((state: any) => state.common.pathConfig)
  const [isShowResult, setIsShowResult] = useState(false)
  const [voiceDetail, setVoiceDetail] = useState(false)
  const [narration, setNarration] = useState('')
  useEffect(() => {
    setNarration('')
  }, [currentShotId])
  const onHandleJumpNext = () => {
    console.log('%c 🚀 ~ [  ]-18', 'font-size:14px; background:green; color:#fff;', selectedVoice)
    if (Object.keys(selectedAudio).length) {
      if (!isShowResult) {
        api
          .confirmResource({ shotId: currentShotId, resourceId: selectedAudio.resourceId, type: currentSelectType })
          .then(async () => {
            dispatch.aiVideo.getShotListByProjectId(Number(id))
            const res: any = await api.getVoiceDetail({ shotId: currentShotId })
            console.log('%c 🚀 ~ [  ]-28', 'font-size:14px; background:green; color:#fff;', res)
            setVoiceDetail(res.dataList)
          })
      }
      setIsShowResult(!isShowResult)
      // dispatch.aiVideo.getShotListByProjectId(Number(id))
    }
  }
  useScrollToBottomHook(scrollAudioRef, 1, () => {
    onChangeGetNewData()
  })

  const saveShotList = () => {
    // 更新分镜头信息

    const cloneShotList = cloneDeep(shotList)
    const res = cloneShotList.map((item: any) => {
      if (item.shotId === currentShotId) {
        return {
          ...item,
          narration,
        }
      }
      return item
    })
    dispatch.aiVideo.updateData({ shotList: res })
    api.saveShotList({
      projectId: Number(id),
      shotInfoDtoList: res,
    })
  }

  const onFinish = ({ uploadOptions }: { uploadOptions: IUploadOptions }) => {
    // 上传音频
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
  const onChangeNarration = (event: any) => {
    setNarration(event.target.value)
    console.log('%c 🚀 ~ [ value ]-60', 'font-size:14px; background:green; color:#fff;', event)
  }
  // onHandleDeleteResourceItem 删除某一项
  const onHandleDeleteResourceItem = (item: any) => {
    api.delResourceItem({ resourceId: item.resourceId, type: currentSelectType }).then(() => {
      onChangeGetNewData()
      dispatch.aiVideo.getShotListByProjectId(Number(id))
    })
  }

  const modalBox = (item: any) => {
    const destroy = () => {
      modalInstance.destroy()
      // modalInstance = null
    }

    const modalInstance = Modal.warning({
      title: '音频预览',
      closeIcon: true,
      icon: null,
      width: 500,
      height: 679,
      content: (
        <div style={{ margin: '0 auto' }}>
          <audio controls style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
            <source src={cdnPath + item.compressUrl} type='audio/mpeg' />
            Your browser does not support the audio element.
          </audio>
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
                &ext=${'mp3'}`,
                `${item.name}.${'mp3'}`,
              )
            }}>
            下载
          </Button>
        </div>
      ),
    })
  }
  return (
    <div className='storyboard-audio'>
      <div className='storyboard-audio__text'>
        <TextArea
          style={{ height: 120, resize: 'none' }}
          onBlur={() => saveShotList()}
          value={narration || selectedShot?.narration}
          onChange={(event: any) => {
            onChangeNarration(event)
          }}
        />
      </div>
      {!isShowResult && (
        <div className='storyboard-audio__header'>
          <span>旁白资源</span>
          <CommonUpload
            beforeUpload={beforeUpload}
            onFinish={onFinish}
            // onError={onError}
            accept={'.mp3'}
            type={EnumUploadType['AUDIO']}>
            <span>导入音频</span>
          </CommonUpload>
        </div>
      )}
      {isShowResult ? (
        <Result data={voiceDetail} type={'voice'} />
      ) : (
        <div ref={scrollAudioRef} className='storyboard-audio__list'>
          {!data.length ? (
            <div className='empty-box'>
              <IconWidget name='empty' />
              <p>空空如也，快去创作音频吧～</p>
            </div>
          ) : (
            data.map((item: any, index: number) => (
              <ResourceItem
                key={index}
                data={item}
                cdnPath={cdnPath}
                ext={'mp3'}
                onHandlePreviewResourceItem={() => {
                  console.log('%c 🚀 ~ [  ]-195', 'font-size:14px; background:green; color:#fff;', '1111')
                  modalBox(item)
                  // 预览
                }}
                onHandleDeleteResourceItem={() => {
                  onHandleDeleteResourceItem(item)
                  // 删除某个资源
                }}
                onClick={() => {
                  dispatch.aiVideo.updateData({ selectedAudio: item })
                }}
                actived={item.resourceId === selectedAudio['resourceId'] || item.isFinal === 'final'}
              />
            ))
          )}
        </div>
      )}

      <div className={`storyboard-audio__btn ${isShowResult ? 'edit-btn' : 'un'}`} onClick={() => onHandleJumpNext()}>
        <span>{isShowResult ? '重新编辑' : '确认旁白'}</span>
      </div>
    </div>
  )
}
