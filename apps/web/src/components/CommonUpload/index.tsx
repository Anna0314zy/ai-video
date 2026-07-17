import { Upload, message } from 'antd'
import type { UploadProps } from 'antd/es/upload'
import { getQiniuUploadToken } from '@/api/models/common'
import { v4 as uuidv4 } from 'uuid'
import { store } from '@/store'
import { LinkOutlined } from '@ant-design/icons'
import { UploadType } from '@/api/types/video'
import { RcFile } from 'antd/lib/upload'
import { EnumUploadType } from '@/api/types/video'
export interface IUploadOptions {
  fileMd5: string
  fileName: string
  storageFullPath: string
}

const uploadPath = (type: string) => {
  const data =
    store.getState().common.pathConfig.storagePathConfigList || store.getState().common.pathConfig.qiniuPathConfigList
  const path = data?.find((o: { type: string }) => o.type == type)?.path

  return path
}
export interface CommonUploadProps {
  onProgress?: (percent: number, uploadOptions?: IUploadOptions) => void
  onFinish?: (result: { uploadOptions: IUploadOptions }) => void
  onError?: (result: { err: Error }) => void
  type: UploadType
  children?: React.ReactNode
  beforeUpload?: (file: RcFile) => Promise<boolean>
  style?: React.CSSProperties
  accept?: string
}
const CommonUpload = ({
  beforeUpload,
  children,
  type = EnumUploadType['IMAGE'],
  onProgress,
  onFinish,
  onError,
  style = {},
  accept,
}: CommonUploadProps) => {
  const uploadProps: UploadProps = {
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    accept: accept,
    // accept: uploadAccept[type],
    customRequest: async (options: any) => {
      console.log('%c 🚀 ~ [ options ]-50', 'font-size:14px; background:green; color:#fff;', options)
      try {
        const { file } = options
        if (beforeUpload) {
          await beforeUpload(file)
        }
        const credentialData = await getQiniuUploadToken()
        if (!store.getState().common.pathConfig?.cdnPath) throw new Error('上传路径获取失败,请刷新页面')
        const suffix = (file.name || '').split('.').pop().toLocaleLowerCase()
        const fileMd5 = uuidv4()
        const folder = uploadPath(type) || ''
        const storageFullPath = [folder, `${fileMd5}.${suffix}`].filter(Boolean).join('/')
        const uploadOptions = {
          fileMd5,
          fileName: file.name,
          storageFullPath,
        }

        await uploadToQiniu({
          file,
          key: storageFullPath,
          token: credentialData.uploadToken,
          uploadHost: credentialData.uploadHost || 'https://up-z1.qiniup.com',
          uploadOptions,
          onProgress,
        })
        onFinish?.({ uploadOptions })
      } catch (e: any) {
        if (e?.message) message.error(e?.message)
        onError?.({ err: e })
      }
    },
  }
  return (
    <Upload {...uploadProps}>{children ? children : <LinkOutlined style={{ cursor: 'pointer', ...style }} />}</Upload>
  )
}
export default CommonUpload

function uploadToQiniu(params: {
  file: File
  key: string
  token: string
  uploadHost: string
  uploadOptions: IUploadOptions
  onProgress?: (percent: number, uploadOptions?: IUploadOptions) => void
}) {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData()
    formData.append('token', params.token)
    formData.append('key', params.key)
    formData.append('file', params.file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', params.uploadHost)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        params.onProgress?.(Math.round((event.loaded / event.total) * 100), params.uploadOptions)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`七牛云上传失败：${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('七牛云上传失败，请检查网络或上传配置'))
    xhr.send(formData)
  })
}
