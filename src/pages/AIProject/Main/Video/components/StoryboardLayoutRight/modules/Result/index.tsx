import { FC, useEffect, useState } from 'react'
import { Descriptions } from 'antd'
import { getCosObjectUrl } from '@/utils'
import './index.less'

const Result: FC<any> = (props: any) => {
  // dataList
  const { data, type } = props
  const [detail, setDetail] = useState([])
  const [picUrl, setPicUrl] = useState('')
  useEffect(() => {
    if (!data.length) return
    if (type !== 'voice') {
      const Image = data?.find((item: any) => item.name === '图片地址')
      if (Object.keys(Image).length) {
        setPicUrl(Image.description)
      }
    }

    const items: any = data.map((item: any, index: number) => {
      if (item.name === '图片地址') {
        return item
      }
      return {
        ...item,
        key: index,
        label: item.name,
        children: item.description,
      }
    })
    setDetail(items)
  }, [data])

  return (
    <div className='result'>
      <div className='result__video'>{picUrl && <img src={picUrl || ''} alt='' />}</div>
      <div className='result__content'>
        <Descriptions items={detail} column={1} colon={false} />
      </div>
    </div>
  )
}

export default Result
