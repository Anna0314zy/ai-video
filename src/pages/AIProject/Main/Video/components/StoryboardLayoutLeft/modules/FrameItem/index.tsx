import { useEffect, useState } from 'react'
import { Image } from 'antd'
import Styles from './index.module.less'
import fallback from '@/components/IconWidget/images/fallback.png'
console.log('Styles', Styles)
interface IStoryboardCard {
  index: number
  img?: string
  active: boolean
  onClick: () => void
  data: any
}
export default (props: IStoryboardCard) => {
  const { index, img, active: active, onClick, data } = props
  useEffect(() => {}, [props])

  return (
    <div className={Styles['storyboard-card']} data-active={active} onClick={onClick}>
      <span className='storyboard-card-index'>{index}.&nbsp;</span>
      <div className='storyboard-card-img'>
        <span style={{ position: 'absolute', left: 0 }}>{data?.shotId}</span>
        <Image src={img} width={149} height={86} preview={false} fallback={fallback} />
        <div className='success'></div>
      </div>
    </div>
  )
}
