import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { LoginUrl } from '@/config/login'

const request = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})
request.interceptors.request.use(
  config => {
    
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
      if (res.status === 200 ) {
        const { data, message: msg, code } = res.data
        if (code === 200) {
          return data
        } else if(Number(code) === 1001001) {
          message.error('登录过期，请重新登录')
          localStorage.removeItem('systemToken')
          window.location.href = LoginUrl
        } else {
          console.log('%c msg', 'color: #00b33c;', msg)
          if (msg) message.error(msg)
          return Promise.reject(res.data)
        }
      }
    } catch (err: any) {
      console.log('%c err', 'color: #00b33c;', err)
      if (err?.body) {
        const body = JSON.parse(err?.body)
        if (body?.message) message.error(body?.message)
        return body
      }
 
    }
  },
  err => {
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
