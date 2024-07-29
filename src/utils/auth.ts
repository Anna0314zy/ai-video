const LoginUrl = `${import.meta.env.VITE_APP_LOGIN}?frontUrl=${location.href}`
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
    location.href = LoginUrl
}