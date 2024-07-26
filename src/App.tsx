import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
import useAuth from '@/router/useAuth'
import './index.less'

function App() {
  useAuth()
  return <RouterProvider router={router} />
}

export default App
