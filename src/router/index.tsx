/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-26 18:18:43
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


const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [{
      index: true,
      element: <Home />,
    },
    {
      path: 'edit/:id',
      element: <Edit />,
      children: [{
        path: 'image',
        element: <Image />,
      },{
        path: 'video',
        element: <Video />,
      }]
    }],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
