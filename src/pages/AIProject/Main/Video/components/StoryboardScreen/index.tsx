import { useState } from 'react'
import { Layout } from 'antd'
import Styles from './index.module.less'
import StoryboardImage from '../StoryboardImage'
import StoryboardVideo from '../StoryboardVideo'

interface IStoryboardScreen {
  data?: any
  step?: number | string // 显示第几步骤
  disabled?: boolean
}

export default (props: IStoryboardScreen) => {
  const [step, setStep] = useState(props.step || 1)
  return (
    <Layout className={Styles['storyboard-image']}>
      <Layout.Sider className='storyboard-image-step'>
        <button
          className='btn-step'
          data-actived={step === 1}
          onClick={() => {
            setStep(1)
          }}>
          <div className='btn-step-index'>1</div>
          <div className='btn-step-text'>图片</div>
        </button>
        <div className='step-divider'></div>
        {/* 图片没有生成，不能操作视频 */}
        <button
          className='btn-step'
          data-actived={step === 2}
          disabled={props.disabled}
          onClick={() => {
            setStep(2)
          }}>
          <div className='btn-step-index'>2</div>
          <div className='btn-step-text'>视频</div>
        </button>
      </Layout.Sider>
      <Layout.Content className='storyboard-image-content'>
        {step === 1 && <StoryboardImage />}
        {step === 2 && <StoryboardVideo />}
      </Layout.Content>
    </Layout>
  )
}
