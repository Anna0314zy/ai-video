import { useState, useEffect } from 'react'

const useFetchWithCache = (axiosFunction: any, refreshInterval: any, storageType = 'session') => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const storage = storageType === 'local' ? localStorage : sessionStorage
  useEffect(() => {
    const fetchData = async () => {
      const cachedData = storage.getItem(`${import.meta.env.VITE_STORAGE_COS_KEY}`)
      const cachedTimestamp: any = storage.getItem(`${import.meta.env.VITE_STORAGE_COS_TIME}`)
      const currentTime: any = Date.now()
      // 超过缓存时间从新请求
      if (cachedData && cachedTimestamp && currentTime - cachedTimestamp < refreshInterval) {
        console.log('%c 🚀 ~ [  ]-17', 'font-size:14px; background:green; color:#fff;', cachedData)
        setData(JSON.parse(cachedData))
        return
      }
      try {
        const result = await axiosFunction()
        if (!result) return
        // 存储数据和时间戳到 storage
        storage.setItem(`${import.meta.env.VITE_STORAGE_COS_KEY}`, JSON.stringify(result))
        storage.setItem(`${import.meta.env.VITE_STORAGE_COS_TIME}`, currentTime)

        setData(result)
      } catch (err: any) {
        setError(err)
      }
    }

    fetchData()

    const intervalId = setInterval(() => {
      fetchData()
    }, 60000)

    return () => clearInterval(intervalId)
    //
  }, [axiosFunction, refreshInterval, storage])

  return { data, error }
}

export default useFetchWithCache
