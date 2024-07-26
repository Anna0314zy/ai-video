const LoginUrl = `${import.meta.env.VITE_APP_LOGIN}?xes-origin=classroom-slides&callback=${
    window.location.origin + window.location.pathname 
  }`
/**
 * @description: 获取localStorage 的token
 * @return {*}
 */
export const getToken = () => {
    return localStorage.getItem('systemToken')
}


/**
 * @description: 退出登录
 * @return {*}
 */
export const logout = () => {
    localStorage.removeItem('systemToken')
    location.href = LoginUrl
}