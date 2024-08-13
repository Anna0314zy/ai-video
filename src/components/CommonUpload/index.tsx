import { Upload, message } from 'antd'
import type { UploadProps } from 'antd/es/upload'
import { getCosCredential } from '@/api/models/common'
import { v4 as uuidv4 } from 'uuid'
import FileUpload, { IAuthInfo, ICOSInfo, IUploadInput } from '@ld/file-upload'
import { store } from '@/store'
interface IUploadOptions {
  fileMd5: string
  fileName: string
  cosFullPath: string
}
const uploadPath = (type: string) => {
  const data = store.getState().common.pathConfig.cosPathConfigList
  const path = data?.find((o: { type: string }) => o.type == type)?.path

  return path
}
interface IProps {
  onProgress?: IUploadInput<File, IUploadOptions>['onProgress']
  onFinish?: IUploadInput<File, IUploadOptions>['onFinish']
  onError?: IUploadInput<File, IUploadOptions>['onError']
}
const CommonUpload = ({ beforeUpload, pathConfigList, type, onProgress, onFinish, onError }: any) => {
  const uploadProps: UploadProps = {
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    // accept: uploadAccept[type],
    customRequest: async (options: any) => {
      try {
        console.log('options', options)
        if (beforeUpload) {
          const res = await beforeUpload()
          if (res) return
        }

        const { file } = options
        const credentialData = await getCosCredential()
        const Bucket = import.meta.env.VITE_BUCKET
        if (!store.getState().common.pathConfig?.cdnPath) throw new Error('上传路径获取失败,请刷新页面')
        const CdnHost = store.getState().common.pathConfig?.cdnPath
        const Region = import.meta.env.VITE_REGION
        const cosInfo: ICOSInfo = {
          Bucket,
          Region,
          Folder: uploadPath(type) || '',
          Secure: true, // 开启https
          CdnHost: CdnHost,
        }
        const authInfo: IAuthInfo = {
          TmpSecretId: credentialData?.credentials?.tmpSecretId || '',
          TmpSecretKey: credentialData?.credentials?.tmpSecretKey || '',
          SecurityToken: credentialData?.credentials?.sessionToken || '',
          StartTime: credentialData?.startTime || 0,
          ExpiredTime: credentialData?.expiredTime || 0,
        }
        // 实例化cos
        const cos = new FileUpload(authInfo, cosInfo)
        const suffix = file.name.split('.').pop().toLocaleLowerCase()
        const Md5 = uuidv4()
        const cosFullPath = cosInfo.Folder + '/' + Md5 + '.' + suffix
        cos.upload({
          file: file,
          onProgress,
          onFinish,
          onError,
          Md5: Md5,
          cosFullPath,
          uploadOptions: {
            fileMd5: Md5,
            fileName: file.name,
            cosFullPath,
          },
        })
      } catch (e: any) {
        if (e?.message) message.error(e?.message)
      }
    },
  }
  return <Upload {...uploadProps}>上传</Upload>
}
export default CommonUpload
