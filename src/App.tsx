import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
// import React from 'react'
import React, { FC, useEffect } from 'react'
import useFetchWithCache from '@/hooks/useFetchWithCache'
import { getCosCredential } from '@/api/models/common'
import './index.less'
import './assets/css/common.less'

function App() {
  // token 凭证存储
  useFetchWithCache(getCosCredential, 3600 * 1000, 'session')
  return <RouterProvider router={router} />
}

export default React.memo(App)
