import api from '../index'
const http = import.meta.env.VITE_API_SERVER
const oldHttp = '/test'
export interface LoginResponse {
  systemToken: string
  email: string
  empNo: string
  name: string
}
// 登录
export const login = (params: { systemToken: string }): Promise<LoginResponse> => {
  return api.post(`${http}/classroom-slides/auth/login`, params)
}

// 更新
export const checkLogin = (params: { systemToken: string }): Promise<LoginResponse> => {
  return api.post(`${http}/classroom-slides/auth/check`, params)
}

export const logout = (params: { empNo: string }): Promise<any> => {
  return api.post(`${http}/classroom-slides/auth/logout`, params)
}
