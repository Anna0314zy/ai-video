import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Button, message, Upload } from 'antd'
import { LinkOutlined, SendOutlined } from '@ant-design/icons'
import * as api from '@/api/models/main'
import { Children } from 'react'
interface IProps {
  onSuccess?: (val: { fileId: number; fileName: string }) => void
  apiName?: string
  accept?: string
  children?: React.ReactNode
  customRequest?: (options: any) => void
  disabled?: boolean
}
const ChatUpload = ({ onSuccess, accept = '.md,.xlsx,.docx', children, customRequest, disabled = false }: IProps) => {
  const props: UploadProps = {
    accept,
    maxCount: 1,
    showUploadList: false,
    customRequest: async options => {
      if (customRequest) {
        return customRequest(options)
      }
      const fileId = await api.fileUpload(options.file)
      onSuccess?.(fileId)
    },
  }
  return (
    <Upload disabled={disabled} {...props}>
      {children ? children : <LinkOutlined style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} />}
    </Upload>
  )
}
export default ChatUpload
