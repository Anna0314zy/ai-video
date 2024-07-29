import { logoutUrl } from "@/config/login"

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
    location.href = logoutUrl
}