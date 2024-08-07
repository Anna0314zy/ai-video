import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Button, message, Upload } from 'antd'
import { LinkOutlined, SendOutlined } from '@ant-design/icons'
import * as api from '@/api/models/main'
const ChatUpload = ({ onSuccess }: { onSuccess: (val: { fileId: number; fileName: string }) => void }) => {
  const props: UploadProps = {
    name: 'file',
    accept: '.md, .xls, .xlsx',
    maxCount: 1,
    showUploadList: false,
    // action: '',
    // headers: {
    //   authorization: 'authorization-text',
    // },
    customRequest: async options => {
      console.log('options', options)
      const fileId = await api.fileUpload(options.file)
      // 请求prompt
      // const res = await api.getScriptPrompt({
      //   fileId,
      // })
      onSuccess(fileId)
      console.log('fileId', fileId)
    },
  }
  return (
    <Upload {...props}>
      <LinkOutlined style={{ cursor: 'pointer' }} />
    </Upload>
  )
}
export default ChatUpload
