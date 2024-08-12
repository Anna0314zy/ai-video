import api from '../index'
const http = import.meta.env.VITE_API_SERVER

// 获取cos临时访问token
export const getCosCredential = async (): Promise<any> => {
  return api.get(`${http}/api/cos/v1/credential?bucketName=${import.meta.env.VITE_BUCKET}`)
}
