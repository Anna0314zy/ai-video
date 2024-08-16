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
// import Video from '@/pages/Edit/components/Video'
import ScriptPage from '@/pages/AIProject/Main/Sctipt'
import VideoProcess from '../pages/AIProject/Main/Video'
import CheckLogin from '@/components/CheckLogin'
const ProtectedHomePage = CheckLogin(ScriptPage)
const ProtectedVideoProcess = CheckLogin(VideoProcess)
const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // {
      //   path: '/chat',
      //   element: <Chat />,
      // },
    ],
  },
  {
    path: '/project/:id',
    // element: <Edit />,
    children: [
      {
        path: 'script',
        // index: true,
        element: <ProtectedHomePage />,
      },
      {
        path: 'video',

        element: <ProtectedVideoProcess />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
