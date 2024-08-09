// 登录地址
// 注意：登录地址需要带上当前页面的url，否则登录后会跳转到首页
export const LoginUrl = `${import.meta.env.VITE_APP_LOGIN}?frontUrl=${
  window.location.origin + window.location.pathname
}`
// 退登地址
export const logoutUrl = `https://sso.saash.vdyoo.com/sso/logout?path=${LoginUrl}`
