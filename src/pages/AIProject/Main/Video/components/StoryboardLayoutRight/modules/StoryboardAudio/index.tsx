import { useState } from 'react'
// import MaterialItem from '@/pages/AIProject/components/MaterialItem'
import ResourceItem from '../ResourceItem'
import Result from '../Result'
import { useSelector, useDispatch } from 'react-redux'
import './index.less'

export default (props: any) => {
  const { data } = props
  const dispatch = useDispatch()
  const { selectedAudio } = useSelector((state: any) => state.aiVideo)
  const [isShowResult, setIsShowResult] = useState(false)
  const onHandleJumpNext = () => {
    console.log('%c 🚀 ~ [  ]-15', 'font-size:14px; background:green; color:#fff;', !Object.keys(selectedAudio).length)
    if (Object.keys(selectedAudio).length) {
      setIsShowResult(!isShowResult)
    }
  }
  return (
    <div className='storyboard-audio'>
      <div className='storyboard-audio__text'>
        温暖的背景音乐开始，慢慢淡入一张19世纪末俄罗斯的老照片，画面中是一间欧洲风格的书房，金黄的阳光从窗户照进来，书房中有一张发黄的高尔基照片，一本封面写着童年的书。
        温暖的背景音乐开始，慢慢淡入一张19世纪末俄罗斯的老照片，画面中是一间欧洲风格的书房，金黄的阳光从窗户照进来，书房中有一张发黄的高尔基照片，一本封面写着童年的书。
      </div>
      <div className='storyboard-audio__header'>
        <span>旁白资源</span>
        <span>导入音频</span>
      </div>
      {isShowResult ? (
        <Result />
      ) : (
        <div className='storyboard-audio__list'>
          {data.map((item: any, index: number) => (
            <ResourceItem
              key={index}
              data={item}
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
