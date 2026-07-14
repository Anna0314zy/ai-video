import api from '../index'
const http = import.meta.env.VITE_API_SERVER
import { PathConfigList } from '../types/video'
// 获取七牛云上传 token
export const getQiniuUploadToken = async (): Promise<any> => {
  return api.get(`${http}/api/qiniu/v1/upload-token?bucketName=${import.meta.env.VITE_QINIU_BUCKET_NAME}`)
}

export const getPathConfig = (): Promise<any> => {
  return api.get<PathConfigList>(`${http}/api/qiniu/v1/pathConfig`, {})
}
