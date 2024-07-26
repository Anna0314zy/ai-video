import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
import React from 'react'
import './index.less'

function App() {
  return <RouterProvider router={router} />
}

export default React.memo(App)
