import CreateProjectBtn from './CreateProjectBtn'
import Styles from '../index.module.less'
export default () => {
  return (
    <>
      <div className={Styles['result-empty']}>
        <div className='result-empty-content'>
          <div className='empty-img'></div>
          <div className='empty-text'>空空如也，什么也没有，快去创建吧～</div>
          <CreateProjectBtn />
        </div>
      </div>
    </>
  )
}
