const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv)
const env = args.mode || 'test'
const { prefix } = require('./publish.config.json')[env]
const qiniuConfig = loadQiniuConfig()

console.log('上传文件到七牛云---')

async function uploadFile(filePath, key) {
  try {
    const formData = new FormData()
    const buffer = fs.readFileSync(filePath)
    formData.append('token', createUploadToken(qiniuConfig.bucketName, qiniuConfig.accessKey, qiniuConfig.secretKey))
    formData.append('key', key)
    formData.append('file', new Blob([buffer]), path.basename(filePath))

    const response = await fetch(qiniuConfig.uploadHost, {
      method: 'POST',
      body: formData,
    })
    return { err: null, ok: response.ok, status: response.status, data: await response.text() }
  } catch (err) {
    console.log(err, 'err')
    return { err: err, ok: false, status: 0, data: null }
  }
}
let obj = {
  dist: path.resolve(process.cwd(), 'dist'),
  qiniuPathFile: `${prefix}/`,
  source: '',
}
uploadAllFile(obj)
function uploadAllFile(obj) {
  fs.readdir(obj.dist, async (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }
    files.forEach(async item => {
      const filePath = path.resolve(process.cwd(), `dist/${obj.source ? obj.source + '/' : ''}${item}`)
      const fileKey = obj.qiniuPathFile + item
      const fileStats = fs.statSync(filePath)
      if (fileStats.isFile()) {
        const { ok } = await uploadFile(filePath, fileKey)
        if (ok) {
          console.log('上传成功', fileKey)
        }
      } else if (fileStats.isDirectory()) {
        uploadAllFile({
          dist: filePath,
          qiniuPathFile: obj.qiniuPathFile + item + '/',
          source: item,
        })
      }
    })
  })
}

function loadQiniuConfig() {
  const localConfigPath = path.resolve(__dirname, 'qiniu.config.json')
  const localConfig = fs.existsSync(localConfigPath) ? require(localConfigPath) : {}
  return {
    bucketName: process.env.QINIU_BUCKET_NAME || localConfig.QINIU_BUCKET_NAME || 'qiqi1234567',
    accessKey: process.env.QINIU_ACCESS_KEY || localConfig.QINIU_ACCESS_KEY,
    secretKey: process.env.QINIU_SECRET_KEY || localConfig.QINIU_SECRET_KEY,
    uploadHost: process.env.QINIU_UPLOAD_HOST || localConfig.QINIU_UPLOAD_HOST || 'https://up-z1.qiniup.com',
  }
}

function createUploadToken(bucketName, accessKey, secretKey) {
  if (!accessKey || !secretKey) {
    throw new Error('请配置 QINIU_ACCESS_KEY 和 QINIU_SECRET_KEY')
  }
  const encodedPolicy = base64UrlEncode(
    JSON.stringify({
      scope: bucketName,
      deadline: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
  const encodedSign = base64UrlEncode(crypto.createHmac('sha1', secretKey).update(encodedPolicy).digest())
  return `${accessKey}:${encodedSign}:${encodedPolicy}`
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
}
