import { logoutUrl, LoginUrl } from '@/config/login'

/**
 * @description: 获取localStorage 的token
 * @return {*}
 */
export const getToken = () => {
  return localStorage.getItem('token') || ''
}
export const setToken = (value: string) => {
  return localStorage.setItem('token', value)
}

/**
 * @description: 退出登录
 * @return {*}
 */
export const logout = () => {
  localStorage.removeItem('token')
  location.href = logoutUrl
}
export const getSysToken = () => {
  const temp = getToken()
  if (!temp) {
    localStorage.removeItem('token')
    window.location.href = LoginUrl
  }
}
