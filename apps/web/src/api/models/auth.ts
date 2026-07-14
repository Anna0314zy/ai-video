import api from '../index'
const http = import.meta.env.VITE_API_SERVER

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  systemToken: string
  accountId: string
  uid: number
  username: string
  workcode: string
  email: string
  empNo: string
  name: string
  expiresAt: number
}
// 登录
export const login = (params: LoginParams): Promise<LoginResponse> => {
  return api.post(`${http}/classroom-slides/auth/login`, params)
}

// 更新
export const checkLogin = (params: { systemToken?: string } = {}): Promise<LoginResponse> => {
  return api.post(`${http}/classroom-slides/auth/check`, params)
}

export const logout = (params: { empNo?: string } = {}): Promise<any> => {
  return api.post(`${http}/classroom-slides/auth/logout`, params)
}
export interface UserInfo {
  accountId: string
  uid: number
  username: string
  workcode: string
}
export const getUerInfo = (): Promise<any> => {
  return api.get<UserInfo>(`${http}/api/account/userInfo/get`)
}
