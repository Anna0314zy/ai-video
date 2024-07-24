import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
import './index.less'

function App() {
  return <RouterProvider router={router} />
}

export default App
