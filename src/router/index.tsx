/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: 周东晨 p_zhoudongchen@ledupeiyou.com
 * @LastEditTime: 2024-07-26 18:47:11
 * @FilePath: /ai-content-platform/src/router/index.tsx
 */
import { createHashRouter } from 'react-router-dom'
import React from 'react'
import MainLayout from '../components/MainLayout'
import NotFound from '../pages/NotFound'
import Home from '../pages/Home'
import Edit from '../pages/Edit'
import Image from '@/pages/Edit/components/Image'
import Video from '@/pages/Edit/components/Video'
import HmePage  from '@/pages/HmePage'
import HomePage from '../pages/HmePage'
import Chat from '../pages/Chat'


const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [{
      index: true,
      element: <Home />,
    },
    {
      path: '/chat',
      element: <Chat />,
    },
    {
      path: 'edit/:id',
      element: <Edit />,
      children: [
      {
        path: 'home',
        element: <HmePage />
      },
      {
        path: 'image',
        element: <Image />,
      }]
    }],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
