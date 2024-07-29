import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ModalCreare from './modules/ModalCreate'

export default () => {
  const [visibleModal, setVisibleModal] = useState(false)
  return (
    <>
      <Button
          type="primary"
          onClick={() => {
            setVisibleModal(true)
          }}>
          <PlusOutlined size={16}/> 新建项目
        </Button>
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
