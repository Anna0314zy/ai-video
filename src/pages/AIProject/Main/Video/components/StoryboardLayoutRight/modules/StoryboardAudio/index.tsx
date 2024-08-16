import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input } from 'antd'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import ResourceItem from '../ResourceItem'
import IconWidget from '@/components/IconWidget'
import Result from '../Result'
import * as api from '@/api/models/video'
import './index.less'
const { TextArea } = Input

export default (props: any) => {
  const { data, onChangeGetNewData } = props
  const dispatch = useDispatch()
  const scrollAudioRef = useRef(null)
  const { selectedAudio, currentShotId, selectedVoice, currentSelectType } = useSelector((state: any) => state.aiVideo)
  const [isShowResult, setIsShowResult] = useState(false)
  const [voiceDetail, setVoiceDetail] = useState(false)
  const onHandleJumpNext = () => {
    console.log('%c 🚀 ~ [  ]-18', 'font-size:14px; background:green; color:#fff;', selectedVoice)
    if (Object.keys(selectedAudio).length) {
      if (!isShowResult) {
        api
          .confirmResource({ shotId: currentShotId, resourceId: selectedAudio.resourceId, type: currentSelectType })
          .then(async () => {
            const res = await api.getVoiceDetail({ shotId: currentShotId })

            console.log('%c 🚀 ~ [  ]-28', 'font-size:14px; background:green; color:#fff;', res)
            setVoiceDetail(res)
          })
      }
      setIsShowResult(!isShowResult)
    }
  }
  useScrollToBottomHook(scrollAudioRef, 1, () => {
    onChangeGetNewData()
  })
  const onHandleAddResource = () => {
    // 导入资源
  }

  return (
    <div className='storyboard-audio'>
      <div className='storyboard-audio__text'>
        <TextArea style={{ height: 120, resize: 'none' }} />
      </div>
      {!isShowResult && (
        <div className='storyboard-audio__header'>
          <span>旁白资源</span>
          <span
            onClick={() => {
              onHandleAddResource()
            }}>
            导入音频
          </span>
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
                onHandlePreviewResourceItem={() => {
                  // 预览
                }}
                onHandleDeleteResourceItem={() => {
                  // 删除某个资源
                }}
                onClick={() => {
                  dispatch.aiVideo.updateData({ selectedAudio: item })
                }}
                actived={item.resourceId === selectedAudio['resourceId']}
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
