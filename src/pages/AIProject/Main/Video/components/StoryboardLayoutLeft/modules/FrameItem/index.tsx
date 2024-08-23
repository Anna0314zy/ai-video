import { useEffect, useState } from 'react'
import { Image } from 'antd'
import Styles from './index.module.less'
import fallback from '@/components/IconWidget/images/fallback.png'
import { nickIcon } from '@/components/IconWidget/Icons'
interface IStoryboardCard {
  index: number
  img?: string
  active: boolean
  item: any
  onClick: () => void
}
export default (props: IStoryboardCard) => {
  const { item, index, img, active: active, onClick } = props
  useEffect(() => {}, [props])
  const done = () => {
    return <div className='circle f-center done'>{nickIcon()}</div>
  }
  const undone = () => {
    return (
      <div className='circle f-center undone'>
        <i></i>
        <i></i>
        <i></i>
      </div>
    )
  }
  return (
    <div className={Styles['storyboard-card']} data-active={active} onClick={onClick}>
      {/* <span style={{ position: 'absolute', top: 20, left: -10 }}>{item?.shotId}</span> */}
      <span className='storyboard-card-index'>{index}.&nbsp;</span>
      <div className='storyboard-card-img'>
        <Image src={img} width={149} height={86} preview={false} fallback={fallback} />

        {item?.status === 'completed' ? (
          <div className='success'>
            {/* <div className='success__circle f-center'>{nickIcon()}</div> */}
            {done()}
            已完成
          </div>
        ) : (
          <div className='progress'>
            <div className={`progress__item ${item?.imageStatus === 'completed' ? 'done' : 'undone'}`}>
              {item?.imageStatus === 'completed' ? done() : undone()}图片
            </div>
            <div className={`progress__item ${item?.videoStatus === 'completed' ? 'done' : 'undone'}`}>
              {item?.videoStatus === 'completed' ? done() : undone()}视频
            </div>
            <div className={`progress__item ${item?.voiceStatus === 'completed' ? 'done' : 'undone'}`}>
              {item?.voiceStatus === 'completed' ? done() : undone()}旁白
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
