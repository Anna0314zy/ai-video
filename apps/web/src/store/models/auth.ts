import { createModel } from '@rematch/core'
import { RootModel } from '.'
import * as api from '@/api/models/auth'
import { LoginUrl } from '@/config/login'
import { getToken, setToken } from '@/utils/auth'
interface AuthState {
  token: string
  userInfo: api.UserInfo
}

export default createModel<RootModel>()({
  state: {
    token: '',
    userInfo: {},
  } as AuthState,
  reducers: {
    updateData(state, params: Partial<AuthState>) {
      return Object.assign(state, params)
    },
  },
  effects: dispatch => ({
    async login(params: api.LoginParams) {
      const res = await api.login(params)
      if (!res) throw new Error('登录响应为空')
      const token = res.token || res.systemToken
      setToken(token)
      dispatch.auth.updateData({
        token,
        userInfo: {
          accountId: res.accountId,
          uid: res.uid,
          username: res.username || res.name,
          workcode: res.workcode || res.empNo,
        },
      })
      return res
    },
    async checkLogin() {
      const systemToken = getToken()
      if (!systemToken) {
        window.location.href = LoginUrl
        return
      }
      const res = await api.checkLogin({ systemToken })
      const token = res.token || res.systemToken
      setToken(token)
      dispatch.auth.updateData({ token })
    },
    async getUserInfo() {
      const res = await api.getUerInfo()
      dispatch.auth.updateData({ userInfo: res || {} })
    },
    // async login() {
    //   const systemToken = getToken()
    //   if (systemToken) {
    //     const userInfo = await api.login({ systemToken })
    //     dispatch.auth.updateData({
    //       token: systemToken,
    //       userInfo,
    //     })
    //   } else {
    //     window.location.href = LoginUrl
    //   }
    // },
    // async checkLogin() {
    //   const systemToken = getToken()
    //   if (systemToken) {
    //     dispatch.auth.updateData({ token: systemToken })
    //     const res = await api.checkLogin({ systemToken })
    //     if (res.systemToken) {
    //       await dispatch.auth.updateData({ token: res.systemToken })
    //       setToken(res.systemToken)
    //     }
    //   }
    // },
    // async logOut(empNo) {
    //   await api.logout({ empNo })
    //   localStorage.removeItem('token')
    //   dispatch.auth.updateData({
    //     token: '',
    //     userInfo: {},
    //   })
    //   window.location.href = LoginUrl
    // },
  }),
})
