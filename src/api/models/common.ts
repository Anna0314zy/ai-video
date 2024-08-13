import api from '../index'
const http = import.meta.env.VITE_API_SERVER
import { PathConfigList } from '../types/script'
// 获取cos临时访问token
export const getCosCredential = async (): Promise<any> => {
  return api.get(`${http}/api/cos/v1/credential?bucketName=${import.meta.env.VITE_BUCKET}`)
}

export const getPathConfig = (): Promise<any> => {
  return api.get<PathConfigList>(`${http}/api/cos/v1/pathConfig`, {})
}
