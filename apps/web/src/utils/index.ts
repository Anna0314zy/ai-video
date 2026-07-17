import axios from 'axios'
import { getToken } from '@/utils/auth'
//文件格式
export enum Ext {
  csv = 'csv',
  md = 'md',
}
/**
 * Get the value of a query parameter from the current URL
 * @param {string} key - The query parameter key
 * @returns {string|null} - The value of the query parameter, or null if not found
 */
export function getQueryParam(key: string) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(key)
}

export function decodeUnicode(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, function (match) {
    return String.fromCharCode(parseInt(match.substr(2), 16))
  })
}

export const downloadFromServer = async (url: string, filename?: string) => {
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
    a.href = blobUrl
    if (filename) a.download = filename // 设置文件名
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

export function convertToMarkdown(text: string) {
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\s/g, ' ')
}

export function normalizeMarkdownSource(text: string) {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```$/i)
  return match ? match[1] : text
}

export function elementScrollIntoView(id: number | string) {
  setTimeout(() => {
    console.log('elementScrollIntoView', id, document.getElementById(String(id)))
    const ele = document.getElementById(String(id))
    ele?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

export function getQiniuObjectUrl(key: string): string {
  if (!key) return ''
  if (/^https?:\/\//.test(key)) return key
  const cdnServer = normalizeUrlOrigin(import.meta.env.VITE_QINIU_PUBLIC_DOMAIN || import.meta.env.VITE_CDN_SERVER)
  return cdnServer ? `${cdnServer}/${key.replace(/^\//, '')}` : key
}

function normalizeUrlOrigin(value: unknown) {
  const raw = `${value || ''}`
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/$/, '')

  return raw.replace(/^https?:\/\/(https?:\/\/)/, '$1')
}

export async function downloadQiniuObjectFile(key: string, filename: string): Promise<void> {
  const response = await axios.get(getQiniuObjectUrl(key), { responseType: 'blob' })
  createDownloadLink(response.data, filename)
}
// Blob下载
async function createDownloadLink(blob: Blob, fileName: string) {
  // 检查浏览器是否支持 showSaveFilePicker
  // if ('showSaveFilePicker' in window) {
  //   const opt = {
  //     types: [
  //       {
  //         description: '文件',
  //         accept: {
  //           'image/png': ['.png'],
  //           'image/jpeg': ['.jpg', '.jpeg'],
  //           'audio/mpeg': ['.mp3'],
  //           'video/mp4': ['.mp4'],
  //         },
  //       },
  //     ],
  //     suggestedName: 'xxx.mp4',
  //     excludeAcceptOption: true,
  //   }
  //   try {
  //     const _blob = new Blob([await blob.text()], { type: 'video/mp4' })
  //     // @ts-ignore
  //     const handle = await window.showSaveFilePicker(opt)
  //     console.log('%c 🚀 ~ [ handle ]-165', 'font-size:14px; background:green; color:#fff;', handle)
  //     const writable = await handle.createWritable(_blob)
  //     console.log('%c 🚀 ~ [ writable ]-166', 'font-size:14px; background:green; color:#fff;', writable)
  //     await writable.write() // 写入 Blob
  //     await writable.close()
  //   } catch (error) {
  //     console.log('%c 🚀 ~ [ error ]-169', 'font-size:14px; background:green; color:#fff;', error)
  //     // 作为后备方案使用 Blob 下载
  //     // const a = document.createElement('a')
  //     // const blobUrl = URL.createObjectURL(blob)
  //     // a.href = blobUrl
  //     // a.download = fileName
  //     // document.body.appendChild(a)
  //     // a.click()
  //     // document.body.removeChild(a)
  //     // URL.revokeObjectURL(blobUrl)
  //   }
  // } else {
  const a = document.createElement('a')
  const blobUrl = URL.createObjectURL(blob)
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
  // }
}
