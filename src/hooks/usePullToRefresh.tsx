import { message } from 'antd'
import { useState, useCallback } from 'react'

const usePullToRefresh = <T,>(fetchData: (current: number) => Promise<T[]>, pageSize: number) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [current, setCurrent] = useState<number>(1) // 跟踪当前页数

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      message.info('没有更多数据')
      message.config({
        top: 100,
        duration: 2,
        maxCount: 1,
      })
    }
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const newData = await fetchData(current)
      setData(prevData => [...prevData, ...newData])
      setCurrent(prevCurrent => prevCurrent + 1) // 更新到下一页
      setHasMore(newData.length === pageSize) // 如果返回的数据条数少于 pageSize，则说明没有更多数据
    } catch (error) {
      console.error('Error loading more data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchData, current, hasMore, loading, pageSize])

  return { data, loading, hasMore, loadMore }
}

export default usePullToRefresh
