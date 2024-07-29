// 登录地址 
export const LoginUrl = `${import.meta.env.VITE_APP_LOGIN}?frontUrl=${location.href}`
// 退登地址
export const logoutUrl = `https://sso.saash.vdyoo.com/sso/logout?path=${LoginUrl}`