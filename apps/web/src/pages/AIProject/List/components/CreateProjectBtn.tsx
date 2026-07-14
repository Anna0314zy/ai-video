import { useRef } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ModalCreate from './ModalCreate'
export default () => {
  const createRef = useRef<{ open: () => void }>()
  return (
    <>
      <Button
        type='primary'
        onClick={() => {
          createRef.current?.open()
        }}>
        <PlusOutlined size={16} /> 新建项目
      </Button>
      <ModalCreate ref={createRef}></ModalCreate>
    </>
  )
}
