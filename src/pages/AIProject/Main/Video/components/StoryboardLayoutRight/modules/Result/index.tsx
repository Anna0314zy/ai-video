import { FC, useEffect, useState } from 'react'
import { Descriptions } from 'antd'
import './index.less'

const Result: FC<any> = (props: any) => {
  const { data, type } = props
  const [detail, setDetail] = useState([])
  useEffect(() => {
    const videoEnum: any = {
      videoId: '视频id',
      created: '创建时间',
      seed: '随机因子',
      motionBucketId: '主体运动',
      fps: '帧率',
      conditionFactor: '背景运动',
    }
    const voiceEnum: any = {
      voiceId: '音频id',
      created: '创建时间',
      language: '语言',
      shortName: '声音',
      style: '情感',
      rate: '语速',
      pitch: '词调',
    }
    const items: any = Object.keys(data).map((item: any, index: number) => {
      const keys = type === 'video' ? videoEnum : voiceEnum
      if (!keys[item] || !keys[item]) return {}
      if (item === 'fps') {
        return {
          key: index,
          label: keys[item],
          children: `${data[item]}帧/S`,
        }
      }
      return {
        key: index,
        label: keys[item],
        children: data[item],
      }
    })
    setDetail(items)
  }, [data])

  console.log('%c 🚀 ~ [ data ]-7', 'font-size:14px; background:green; color:#fff;', data)
  return (
    <div className='result'>
      <div className='result__video'>{data.picUrl && <img src={data.picUrl || ''} alt='' />}</div>
      <div className='result__content'>
        <Descriptions items={detail} column={1} colon={false} />
      </div>
    </div>
  )
}

export default Result
