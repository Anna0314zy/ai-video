import { createHashRouter } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import NotFound from '../pages/NotFound'
import Home from '../pages/Home'
import Edit from '../pages/Edit'
import HomePage from '../pages/HmePage'


const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/home',
        element: <HomePage />
      },
      {
        path: '/edit/:id',
        element: <Edit />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
