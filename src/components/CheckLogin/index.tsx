import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import { Spin, Flex } from 'antd'
const CheckLogin = (Component: React.ComponentType) => {
  return () => {
    const dispatch = useDispatch<Dispatch>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
      const fetchUserInfo = async () => {
        await dispatch.auth.getUserInfo()
        setIsLoaded(true)
      }

      fetchUserInfo()
    }, [dispatch])

    if (!isLoaded) {
      return (
        <Flex align={'center'} justify={'center'} style={{ width: '100vh', height: '100vh' }}>
          <Spin>Loading...</Spin>
        </Flex>
      ) // 或者你可以用一个自定义的加载组件
    }

    return <Component />
  }
}

export default CheckLogin
