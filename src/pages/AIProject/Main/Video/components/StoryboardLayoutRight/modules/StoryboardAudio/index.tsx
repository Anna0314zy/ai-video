import './index.less'
import MaterialItem from '@/pages/AIProject/components/MaterialItem'
import Result from '../Result'
import { useSelector, useDispatch } from 'react-redux'

export default (props: any) => {
  const { data } = props
  const dispatch = useDispatch()
  const { selectedAudio } = useSelector((state: any) => state.aiVideo)
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
      <div className='storyboard-audio__list'>
        {data.map((item: any, index: number) => (
          <MaterialItem
            key={index}
            data={item}
            onChange={() => {
              dispatch.aiVideo.updateData({ selectedAudio: item })
            }}
            actived={item.id === selectedAudio['id']}
          />
        ))}
      </div>
      <div className='storyboard-audio__btn' onClick={() => {}}>
        <span>{'确认旁白'}</span>
      </div>
      <Result />
    </div>
  )
}
