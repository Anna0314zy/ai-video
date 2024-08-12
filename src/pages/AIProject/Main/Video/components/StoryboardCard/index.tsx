import { useEffect, useState, useContext, useCallback } from 'react'
import { Image } from 'antd'
import Styles from './index.module.less'
import { MyContext } from '../../'
import { ShotList } from '@/api/type'
interface IStoryboardCard {
  data: ShotList
}
export default (props: IStoryboardCard) => {
  const { curId, setCurId } = useContext(MyContext)
  const { data } = props
  const onClick = useCallback(() => {
    setCurId(data.id)
  }, [])
  return (
    <div className={Styles['storyboard-card']} data-actived={data.id === curId} onClick={onClick}>
      <div className='storyboard-card-index'>{data.sortIndex}.</div>
      <div className='storyboard-card-img'>
        <Image src={data.url} width={'100%'} height={'100%'} preview={false} />
      </div>
    </div>
  )
}
