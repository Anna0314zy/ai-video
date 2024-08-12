import { Fragment, useState } from 'react'
import { Layout } from 'antd'
import Styles from './index.module.less'
import StoryboardVideo from '../StoryboardVideo'
import MaterialItem from '@/pages/AIProject/components/MaterialItem'
interface IStoryboardScreen {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
}

export default (props: IStoryboardScreen) => {
  const { data } = props
  const [step, setStep] = useState(props.step || 1)
  const [currentSelected, setCurrentSelected]: any = useState({})
  const [imgData, setImgData] = useState(data)
  const [videoData, setVideoData] = useState(data)
  const setpData = [
    {
      id: 1,
      name: '图片',
    },
    {
      id: 2,
      name: '视频',
    },
  ]
  return (
    <Layout className={Styles['storyboard-image']}>
      <Layout.Sider className='storyboard-image-step'>
        {setpData.map((item, index) => (
          <Fragment key={index}>
            <button
              className='btn-step'
              data-actived={step === index + 1}
              onClick={() => {
                // setStep(item.id)
              }}>
              <div className='btn-step-index'>{item.id}</div>
              <div className='btn-step-text'>{item.name}</div>
            </button>
            {setpData.length - 1 !== index && <div className='step-divider'></div>}
          </Fragment>
        ))}
      </Layout.Sider>
      <Layout.Content className='storyboard-image-content'>
        <div className='storyboard-image-content__header'>
          <span>{step === 1 ? '图片' : '视频'}资源</span>
          <span>导入{step === 1 ? '图片' : '视频'}</span>
        </div>
        <div className='storyboard-image-content__list'>
          {imgData.map((item: any, index: number) => (
            <MaterialItem
              key={index}
              data={item}
              onChange={() => {
                setCurrentSelected(item)

                console.log(
                  '%c 🚀 ~ [  ]-59',
                  'font-size:14px; background:green; color:#fff;',
                  item,
                  item.scriptId === currentSelected['scriptId'],
                )
              }}
              actived={item.scriptId === currentSelected['scriptId']}
            />
          ))}
        </div>
        {/* {step === 1 && <StoryboardImage />} */}
        {/* {step === 2 && <StoryboardVideo />} */}
      </Layout.Content>
    </Layout>
  )
}
