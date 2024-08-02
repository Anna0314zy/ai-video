import { Layout, Menu } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import AIProject from '../AIProject'
const menuData = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: '我的工程',
  },
]
export default () => {
  return (
    <>
      <Layout style={{ height: '100%' }}>
        <Layout.Sider>
          <Menu theme='light' mode='inline' defaultSelectedKeys={['1']} items={menuData} />
        </Layout.Sider>
        <Layout.Content>
          <AIProject />
        </Layout.Content>
      </Layout>
    </>
  )
}
