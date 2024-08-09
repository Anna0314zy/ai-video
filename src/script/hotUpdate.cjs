const COS = require('cos-nodejs-sdk-v5')
const cosConfig = require('./cos.config.json')
const fs = require('fs')
const path = require('path')
const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv)
const env = args.mode || 'test'
const { prefix } = require('./publish.config.json')[env]
console.log('上传文件---')
const cosInstance = new COS({
  SecretId: cosConfig.COS_ACCESS_KEY,
  SecretKey: cosConfig.COS_SECRET_KEY,
})
async function uploadFile(filePath, key, isDirectory) {
  try {
    var data = await cosInstance.putObject({
      Bucket: cosConfig.COS_BUCKET,
      Region: cosConfig.COS_REGION,
      Key: key,
      Body: isDirectory ? '' : fs.createReadStream(filePath),
    })
    return { err: null, data: data }
  } catch (err) {
    console.log(err, 'err')
    return { err: err, data: null }
  }
}
let obj = {
  dist: path.resolve(process.cwd(), 'dist'),
  cosPathFile: `${prefix}/`,
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
      const fileKey = obj.cosPathFile + item
      const fileStats = fs.statSync(filePath)
      if (fileStats.isFile()) {
        // 处理文件逻辑
        const { data } = await uploadFile(filePath, fileKey)
        if (data.statusCode === 200) {
          console.log('上传成功', fileKey)
        }
        // TODO: 在特殊处理中执行您的逻辑
      } else if (fileStats.isDirectory()) {
        // 处理文件夹逻辑
        const { data } = await uploadFile(filePath, fileKey + '/', true)
        if (data.statusCode === 200) {
          uploadAllFile({
            dist: filePath,
            cosPathFile: obj.cosPathFile + item + '/',
            source: item,
          })
        }
      }
    })
  })
}
