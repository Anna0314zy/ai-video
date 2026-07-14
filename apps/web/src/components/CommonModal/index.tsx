import { useState, forwardRef, useCallback, memo, useImperativeHandle } from 'react'
import { Modal } from 'antd'
import type { ModalProps } from 'antd/es/modal'
import Style from './index.module.less'
interface IProps extends ModalProps {
  onOk: () => Promise<any>
  onCancel: () => void
  fullScreen?: boolean
}
export type ModalHandle = {
  open: () => void
  cancel: () => void
}

const CommonModal = forwardRef<ModalHandle, IProps>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleCancel = useCallback(() => {
    props?.onCancel()
    setVisible(false)
  }, [props])
  const open = () => {
    setVisible(true)
  }
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    open,
    cancel: handleCancel,
  }))
  const handleOk = useCallback(async () => {
    setConfirmLoading(true)
    try {
      await props.onOk()
      handleCancel()
    } finally {
      setConfirmLoading(false)
    }
  }, [handleCancel, props])
  const { children, onOk, onCancel, ...test } = props
  return (
    <Modal
      open={visible}
      centered={true}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      {...test}
      cancelText='取消'
      okText='确认'
      className={props.fullScreen ? Style['full-screen-modal'] : ''}>
      {children}
    </Modal>
  )
})

export default memo(CommonModal)
