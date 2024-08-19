import React, { Component } from 'react'
import { Layout, Modal, Button } from 'antd'
import { connect } from 'react-redux'

class PreViewModal extends Component {
  handleCancel = () => {
    Modal.destroyAll() // 关闭当前 Modal
  }

  handleDelete = () => {
    const { item, onHandleDeleteResourceItem }: any = this.props
    onHandleDeleteResourceItem(item)
    this.handleCancel() // 关闭 Modal
  }

  render() {
    const { step, item, cdnPath } = this.props

    return Modal.warning({
      title: '图片预览',
      closeIcon: true,
      width: 1080,
      height: 679,
      content: (
        <div>
          {step === 1 ? (
            <img style={{ width: 1000 }} className='preview-img' src={`${cdnPath}${item.compressUrl}`} alt='' />
          ) : (
            <video controls style={{ width: 1000 }}>
              <source src={`${cdnPath}${item.compressUrl}`} type='video/mp4' />
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
          <Button key='del' onClick={this.handleDelete}>
            删除
          </Button>
          <Button type='primary'>下载</Button>
        </div>
      ),
    })
  }
}

// Redux state mapping
const mapStateToProps = (state: any) => ({
  cdnPath: state.common.pathConfig.cdnPath,
})

// Connect the component to Redux
export default connect(mapStateToProps)(PreViewModal)
