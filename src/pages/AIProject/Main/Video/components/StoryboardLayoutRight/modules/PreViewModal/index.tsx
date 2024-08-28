import React from 'react'
import { Modal, Button } from 'antd'
import { connect } from 'react-redux'
import { getCosObjectUrl } from '@/utils'
class PreViewModal {
  modalInstance: any
  cdnPath: any
  constructor() {
    this.modalInstance = null // 用于存储 Modal 实例
  }

  show(step: number, item: any, cdnPath: string, onHandleDeleteResourceItem: () => void) {
    if (this.modalInstance) {
      this.modalInstance.destroy() // 销毁已有的 Modal 实例
    }

    this.modalInstance = Modal.warning({
      title: '图片预览',
      closeIcon: true,
      width: 1080,
      height: 679,
      content: (
        <div>
          {step === 1 ? (
            <img style={{ width: 1000 }} className='preview-img' src={`${getCosObjectUrl(item.compressUrl)}`} alt='' />
          ) : (
            <video controls style={{ width: 1000 }}>
              <source src={`${getCosObjectUrl(item.compressUrl)}`} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ),
      footer: (
        <div>
          <Button key='cancel' onClick={this.handleCancel}>
            取消
          </Button>
          <Button key='del' onClick={() => this.handleDelete(item, onHandleDeleteResourceItem)}>
            删除
          </Button>
          <Button type='primary'>下载</Button>
        </div>
      ),
    })
  }

  handleCancel() {
    if (this.modalInstance) {
      this.modalInstance.destroy()
      this.modalInstance = null
    }
  }

  handleDelete(item: any, onHandleDeleteResourceItem: () => void) {
    // @ts-ignore
    onHandleDeleteResourceItem(item)
    this.handleCancel()
  }
}

// 创建单例实例
const preViewModalInstance = new PreViewModal()

const mapStateToProps = (state: any) => ({
  cdnPath: state.common.pathConfig.cdnPath,
})

// 导出显示函数
export const showPreViewModal = (step: number, item: any, onHandleDeleteResourceItem: () => void) => {
  preViewModalInstance.show(step, item, preViewModalInstance.cdnPath, onHandleDeleteResourceItem)
}

// 连接 Redux，并提供 cdnPath 用于构造 Modal
// @ts-ignore
export default connect(mapStateToProps)(preViewModalInstance)
