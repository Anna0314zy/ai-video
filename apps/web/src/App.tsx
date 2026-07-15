import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
import React from 'react'
import './index.less'
import './assets/css/common.less'
import { SocketProvider } from '@/hooks/useSocket'

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  )
}

export default React.memo(App)
