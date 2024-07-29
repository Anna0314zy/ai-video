import { useState } from 'react'
import { Button, ConfigProvider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ModalCreare from './modules/ModalCreate'
import Styles from './index.module.less'

export default () => {
  const [visibleModal, setVisibleModal] = useState(false)
  return (
    <>
      <button
          className={Styles['btn-create-project']}
          onClick={() => {
            setVisibleModal(true)
          }}>
          <PlusOutlined size={16} className='icon-create'/> 新建项目
        </button>
      {visibleModal && (
        <ModalCreare
          visible={visibleModal}
          close={() => {
            setVisibleModal(false)
          }}
        />
      )}
    </>
  )
}
