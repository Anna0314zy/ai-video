import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useScrollToBottomHook } from '@/hooks/useScrollBottom'
import ResourceItem from '../ResourceItem'
import Result from '../Result'
import * as api from '@/api/models/video'
import './index.less'

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
            const videoEnum: any = {
              voiceId: '旁白音频id',
              created: '创建时间',
              language: '语言',
              shortName: '声音',
              style: '情感',
              rate: '语速',
              pitch: '词调',
            }
            const res = await api.getVoiceDetail({ shotId: currentShotId })
            const items: any = Object.keys(res).map((item: string, index: number) => {
              return {
                key: index,
                label: videoEnum[item],
                children: res[item],
              }
            })
            setVoiceDetail(items)
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
        温暖的背景音乐开始，慢慢淡入一张19世纪末俄罗斯的老照片，画面中是一间欧洲风格的书房，金黄的阳光从窗户照进来，书房中有一张发黄的高尔基照片，一本封面写着童年的书。
        温暖的背景音乐开始，慢慢淡入一张19世纪末俄罗斯的老照片，画面中是一间欧洲风格的书房，金黄的阳光从窗户照进来，书房中有一张发黄的高尔基照片，一本封面写着童年的书。
      </div>
      <div className='storyboard-audio__header'>
        <span>旁白资源</span>
        <span
          onClick={() => {
            onHandleAddResource()
          }}>
          导入音频
        </span>
      </div>
      {isShowResult ? (
        <Result data={voiceDetail} />
      ) : (
        <div ref={scrollAudioRef} className='storyboard-audio__list'>
          {data.map((item: any, index: number) => (
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
          ))}
        </div>
      )}
      <div className={`storyboard-audio__btn ${isShowResult ? 'edit-btn' : 'un'}`} onClick={() => onHandleJumpNext()}>
        <span>{isShowResult ? '重新编辑' : '确认旁白'}</span>
      </div>
    </div>
  )
}
