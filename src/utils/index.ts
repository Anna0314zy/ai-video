import axios from 'axios'
import COS from 'cos-js-sdk-v5'
import { getCosCredential } from '@/api/models/common'
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
  // 处理文本中的特殊字符
  // 将 \s 替换为普通空格
  // 将 \t 替换为 Markdown 表格列分隔符
  // 将 \n 替换为 Markdown 行分隔符
  const replacedText = text
    .replace(/\\s/g, '  ') // 替换 \s 为普通空格
    .replace(/\\t/g, '  ') // 替换 \t 为管道符
  // .split('\\n') // 按 \n 分隔行

  // 生成 Markdown 表格
  // console.log(replacedText.replace(/(\\S)\\n/g, '$1  \n'))

  return replacedText.replace(/(\S)\\n/g, '$1  \n').replace(/\\n/g, '  \n')
}

export function elementScrollIntoView(id: number | string) {
  setTimeout(() => {
    console.log('elementScrollIntoView', id, document.getElementById(String(id)))
    const ele = document.getElementById(String(id))
    ele?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

// 获取url
export function getCosObjectUrl(key: string): any {
  const tempCreds = JSON.parse(sessionStorage.getItem(`${import.meta.env.VITE_STORAGE_COS_KEY}`) || '')
  if (Object.keys(tempCreds).length) {
    const cos = createCosInstance(tempCreds)
    const url = getObjectUrl(cos, key)
    // VITE_CDN_SERVER  替换cdn
    const newUrl = url?.replace(`${import.meta.env.VITE_COS_URL}`, `${import.meta.env.VITE_CDN_SERVER}`)
    return newUrl
  }
}

// 下载
export function downloadCosObjectFile(key: string, filename: string): any {
  const tempCreds = JSON.parse(sessionStorage.getItem(`${import.meta.env.VITE_STORAGE_COS_KEY}`) || '')
  if (Object.keys(tempCreds).length) {
    const cos = createCosInstance(tempCreds)
    return downloadObject(cos, key, filename)
  }
}

function createCosInstance(tempCreds: any): COS {
  return new COS({
    SecretId: tempCreds.credentials.tmpSecretId,
    SecretKey: tempCreds.credentials.tmpSecretKey,
    SecurityToken: tempCreds.credentials.sessionToken,
    ExpiredTime: tempCreds.expiredTime,
    StartTime: tempCreds.startTime,
  })
}

function getObjectUrl(cos: COS, key: string): string {
  const bucket = `${import.meta.env.VITE_BUCKET}`
  const region = `${import.meta.env.VITE_REGION}`
  return cos.getObjectUrl(
    {
      Bucket: bucket,
      Region: region,
      Key: key,
    },
    (err, data) => {
      if (err) {
        err
      } else {
        return data.Url
      }
    },
  )
}

function downloadObject(cos: COS, key: string, filename: string): any {
  // 获取对象内容 测试桶 ld-ai-tool-test-1313601664 线上桶用ld-ai-tool-prod-1313601664
  const bucket = `${import.meta.env.VITE_BUCKET}`
  const region = `${import.meta.env.VITE_REGION}`

  return cos.getObject(
    {
      Bucket: bucket,
      Region: region,
      Key: key,
      DataType: 'blob',
    },
    (err, data: any) => {
      if (err) {
      } else {
        createDownloadLink(data.Body, filename)
      }
    },
  )
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
