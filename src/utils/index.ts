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
  console.log('%c 🚀 ~ [ url ]-27', 'font-size:14px; background:green; color:#fff;', url)
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

export async function accessCosWithTempCredentialsUrl(key: string) {
  let result = ''
  try {
    const tempCreds = await getCosCredential()
    const cos = new COS({
      SecretId: tempCreds.credentials.tmpSecretId,
      SecretKey: tempCreds.credentials.tmpSecretKey,
      SecurityToken: tempCreds.credentials.sessionToken,
      ExpiredTime: tempCreds.expiredTime,
      StartTime: tempCreds.startTime,
    })
    // 示例：获取对象内容 这里是测试桶 线上桶用ld-ai-tool-prod-1313601664
    const bucket = 'ld-ai-tool-test-1313601664'
    const region = 'ap-beijing' // 根据实际情况选择区域

    cos.getObjectUrl(
      {
        Bucket: bucket,
        Region: region,
        Key: key || '/text2img/8321373e-12d6-4719-9f38-fd924ad76e80.png',
      },
      function (err, data) {
        if (err) {
          console.log('%c 🚀 ~ [ err ]-97', 'font-size:14px; background:green; color:#fff;', err)
        } else {
          console.log('%c 🚀 ~ [  ]-104', 'font-size:14px; background:green; color:#fff;', JSON.stringify(data.Url))
          // 创建一个临时的 `<a>` 元素
          const link = document.createElement('a')
          link.style.display = 'none'
          link.setAttribute('href', data.Url)
          link.setAttribute('download', 'fileName')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          // window.location.href = data.Url + `?fileName=xxx.mp4`
        }
      },
    )
    return result
  } catch (error) {
    console.log('%c 🚀 ~ [ error ]-104', 'font-size:14px; background:green; color:#fff;', error)
  }
}
