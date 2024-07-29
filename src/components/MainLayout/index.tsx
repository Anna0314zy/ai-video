/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: 周东晨 p_zhoudongchen@ledupeiyou.com
 * @LastEditTime: 2024-07-26 18:28:32
 * @FilePath: /ai-content-platform/src/components/MainLayout/index.tsx
 */
import { Outlet } from 'react-router-dom'
import { Layout, Dropdown, Breadcrumb,Badge, MenuProps } from 'antd'
import Enter from '@/router/useAuth'
import Styles from './index.module.less'
import { logout } from '@/utils/auth'


export default function MainLayout() {
  const useInfo = {
    name: 'admin',
  }
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <div className='logOut' onClick={logout}>退出登录</div>,
    },
  ]
  return (
    <Enter>
      <Layout className={Styles['main-layout']}>
        <Layout.Header className='main-layout-header'>
          <div className='header-wrapper'>
            <div className='header-left'>
              <img className='icon-logo' src='./logo.ico' />
              <span className='header-title'>内容AI工具</span>
            </div>
            <div className='header-right'>
              <img className='icon-settings' src={require("@/assets/images/icon_settings.png")}/>
              <Badge dot={true}>
                <img className='icon-notify' src={require("@/assets/images/icon_notify.png")}/>
              </Badge>
              <Dropdown menu={{ items }} placement='bottomLeft'>
                <div className='header-useInfo'>
                  <div className='header-avatar'>{useInfo.name?.substring(0, 1)}</div>
                  <span className='header-username'>{useInfo.name}</span>
                  <img className='icon-arrow-bottom' src={require("@/assets/images/icon_arrow_bottom.png")}/>
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
    </Enter>
  )
}
