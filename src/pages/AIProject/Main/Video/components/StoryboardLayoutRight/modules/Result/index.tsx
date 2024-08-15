import { FC } from 'react'
import { Descriptions } from 'antd'
import './index.less'

const Result: FC<any> = (props: any) => {
  const { data } = props
  const items = [
    {
      key: '1',
      label: 'UserName',
      children: 'Zhou Maomao',
    },
    {
      key: '2',
      label: 'Telephone',
      children: '1810000000',
    },
    {
      key: '3',
      label: 'Live',
      children: 'Hangzhou, Zhejiang',
    },
    {
      key: '4',
      label: 'Remark',
      children: 'empty',
    },
    {
      key: '5',
      label: 'Address',
      children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
    },
  ]
  return (
    <div className='result'>
      <div className='result__video'>视频</div>
      <div className='result__content'>
        <Descriptions items={items} column={1} />
      </div>
    </div>
  )
}

export default Result
