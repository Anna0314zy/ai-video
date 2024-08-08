import axios from 'axios'
import { getToken } from '@/utils/auth'

//文件格式
export enum Ext {
  xlsx = 'xlsx',
  md = 'md',
}
/**
 * Get the value of a query parameter from the current URL
 * @param {string} key - The query parameter key
 * @returns {string|null} - The value of the query parameter, or null if not found
 */
export function getQueryParam(key: string) {
  const urlParams = new URLSearchParams(window.location.search)
  console.log('urlParams', urlParams, urlParams.get(key))
  return urlParams.get(key)
}

export function decodeUnicode(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
    return String.fromCharCode(parseInt(match.substr(2), 16))
  })
}

export const downloadFromServer = async (url: string, filename: string) => {
  try {
    // 发起 GET 请求，设置 responseType 为 'blob'
    const response = await axios.get(`${url}`, {
      responseType: 'blob', // 处理响应为 Blob 对象
      headers: {
        Authorization: getToken(),
      },
    })
    // 创建一个 Blob URL
    const blob = response.data
    // 创建一个临时的 `<a>` 元素
    const a = document.createElement('a')

    // 使用 URL.createObjectURL 创建一个指向 Blob 的 URL
    const blobUrl = URL.createObjectURL(blob)
    console.log('blobUrl', blobUrl)
    a.href = blobUrl
    a.download = filename // 设置文件名
    // 触发点击事件来启动下载
    document.body.appendChild(a) // 必须将元素添加到 DOM 中
    a.click()
    // 清理
    URL.revokeObjectURL(blobUrl) // 释放 Blob 对象
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download failed:', error)
  }
}
