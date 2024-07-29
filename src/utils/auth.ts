import { LoginUrl } from "@/config/login"
export const logoutUrl = `https://sso.saash.vdyoo.com/sso/logout?path=${location.href}`
/**
 * @description: 获取localStorage 的token
 * @return {*}
 */
export const getToken = () => {
    return localStorage.getItem('token')
}


/**
 * @description: 退出登录
 * @return {*}
 */
export const logout = () => {
    localStorage.removeItem('token')
    location.href = `https://sso.saash.vdyoo.com/sso/logout?path=${encodeURIComponent(LoginUrl)}`
}