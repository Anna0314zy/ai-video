import SparkMD5 from 'spark-md5'

export const md5Hash = (
  file: any,
): Promise<{
  md5: string
  // base64Hash: string
}> => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader()
    // @ts-ignore
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      currentChunk = 0,
      chunkSize = 2 * 1024 * 1024,
      chunks = Math.ceil(file.size / chunkSize)
    function loadNext() {
      const start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    }

    fileReader.onload = async (e: any) => {
      spark.append(e.target.result) // Append array buffer
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        const md5 = spark.end()

        // 将十六进制字符串转换为二进制字符串
        let binaryHash = ''
        for (let i = 0; i < md5.length; i += 2) {
          const hexByte = md5.substr(i, 2)
          const binaryByte = String.fromCharCode(parseInt(hexByte, 16))
          binaryHash += binaryByte
        }

        // 将二进制字符串转换为 Base64 编码
        // const base64Hash = btoa(binaryHash)

        // console.log(base64Hash);
        resolve({
          md5: md5,
          // base64Hash,
        })
      }
    }

    fileReader.onerror = function () {
      reject('error')
    }

    loadNext()
  })
}
