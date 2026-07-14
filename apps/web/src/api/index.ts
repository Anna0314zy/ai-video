import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { LoginUrl } from '@/config/login'
import { getToken } from '@/utils/auth'

const request = axios.create({
  timeout: 60000 * 2,
  headers: {
    'Content-Type': 'application/json',
  },
})
request.interceptors.request.use(
  config => {
    config.headers.Authorization = getToken()
    return config
  },
  err => {
    return Promise.reject(err)
  },
)

export interface ResponseData<T = any> {
  data: T
  message: string
  code: number
}

request.interceptors.response.use(
  (res: AxiosResponse<ResponseData>) => {
    try {
      if (res.status === 200 || res.data.code === 200) {
        const { data, message: msg, code } = res.data
        const NumCode = Number(code)
        switch (NumCode) {
          case 200:
            return data
          case 30001:
            message.error('登录过期，请重新登录')
            localStorage.removeItem('token')
            window.location.href = LoginUrl
            return Promise.reject(res.data)
          default:
            if (msg) message.error(msg)
            return Promise.reject(res.data)
        }
      }
    } catch (err: any) {
      if (err?.body) {
        const body = JSON.parse(err?.body)
        if (body?.message) message.error(body?.message)
        return Promise.reject(body)
      }
      return Promise.reject(err)
    }
  },
  err => {
    const data = err?.response?.data
    const code = data?.code
    console.log(err)
    if (Number(code) === 30001) {
      message.error('登录过期，请重新登录')
      localStorage.removeItem('token')
      window.location.href = LoginUrl
      return Promise.reject(data)
    }
    message.error(err?.message)
    return Promise.reject(err?.response?.data || err)
  },
)

const http = {
  get: <T>(url: string, params: Record<string, any> = {}, configs?: AxiosRequestConfig): Promise<T> => {
    return request.get(url, {
      params,
      ...configs,
    })
  },
  post: <T>(url: string, data: Record<string, any> = {}, configs?: AxiosRequestConfig): Promise<T> => {
    return request.post(url, data, configs)
  },
  put: <T>(url: string, data: Record<string, any> = {}, configs?: AxiosRequestConfig): Promise<T> => {
    return request.put(url, data, configs)
  },
  del: <T>(url: string, data: Record<string, any> = {}, configs?: AxiosRequestConfig): Promise<T> => {
    return request.delete(url, {
      data,
      ...configs,
    })
  },
}
export default http
