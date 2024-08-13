/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: 周东晨 p_zhoudongchen@ledupeiyou.com
 * @LastEditTime: 2024-07-26 18:28:32
 * @FilePath: /ai-content-platform/src/components/MainLayout/index.tsx
 */
import { Outlet } from 'react-router-dom'
import { Layout, Dropdown, Badge, MenuProps, Menu, ConfigProvider } from 'antd'
import Auth from '@/hooks/useAuth'
import Styles from './index.module.less'
import { logout } from '@/utils/auth'
import IconWidget from '@/components/IconWidget/index'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
export default function MainLayout() {
  const { userInfo } = useSelector((state: RootState) => state.auth)
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className='logOut' onClick={logout}>
          退出登录
        </div>
      ),
    },
  ]

  return (
    <Auth>
      <Layout className={Styles['main-layout']}>
        <Layout.Header className='main-layout-header'>
          <div className='header-wrapper'>
            <div className='header-left'>
              <img className='icon-logo' src='./logo.ico' />
              <span className='header-title'>内容AI工具</span>
            </div>
            <div className='header-right'>
              <IconWidget className='icon-settings' name='settings' />
              <Badge dot={true}>
                <IconWidget className='icon-notify' name='notify' />
              </Badge>
              <Dropdown menu={{ items }} placement='bottomLeft'>
                <div className='header-useInfo'>
                  <div className='header-avatar'>{userInfo.username?.substring(0, 1)}</div>
                  <span className='header-username'>{userInfo.username}</span>
                  <IconWidget className='icon-arrow-bottom' name='arrowBottom' />
                </div>
              </Dropdown>
            </div>
          </div>
          {/* <Breadcrumb className='header-breadcrumb' items={[{ title: 'Home' }, { title: 'List' }]}></Breadcrumb> */}
        </Layout.Header>
        <Layout.Content className='main-layout-context'>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Auth>
  )
}
