/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-26 15:02:36
 * @FilePath: /ai-content-platform/src/components/MainLayout/index.tsx
 */
import { Outlet } from 'react-router-dom'
import { Layout, Dropdown, Breadcrumb, MenuProps } from 'antd'
import './index.less'
import React from 'react'

export default function MainLayout() {
  const useInfo = {
    name: 'admin',
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <div className='logOut'>退出登录</div>,
    },
  ]
  return (
    <Layout className='main-layout'>
      <Layout.Header className='main-layout-header'>
        <div className='header-wrapper'>
          <div className='header-logo'>
            <img className='icon-logo' src='./logo.ico' />
            <span className='header-title'>内容AI工具</span>
          </div>
          <Dropdown menu={{ items }} placement='bottomLeft'>
            <div className='header-useInfo'>
              <div className='header-avatar'>{useInfo.name?.substring(0, 1)}</div>
              <span className='header-username'>{useInfo.name}</span>
            </div>
          </Dropdown>
        </div>
        {/* <Breadcrumb className='header-breadcrumb' items={[{ title: 'Home' }, { title: 'List' }]}></Breadcrumb> */}
      </Layout.Header>
      <Layout.Content className='main-layout-context'>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}
