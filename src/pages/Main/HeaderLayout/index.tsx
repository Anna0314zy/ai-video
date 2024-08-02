import { Layout, Flex } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import Styles from '../index.module.less'

const { Header } = Layout
const headerStyle: React.CSSProperties = {
  color: '#fff',
  height: 64,
  padding: '0 24px',
  lineHeight: '64px',
  backgroundColor: 'rgba(255, 255, 255, 1)',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}
interface headerProps {
  leftChildren: any
  rightChildren: any
}

const HeaderLayout = (props: headerProps) => {
  const { leftChildren, rightChildren } = props
  return (
    <Header style={headerStyle} className={Styles['home-header']}>
      <Flex style={{ height: '100%', width: '100%' }} align='center' justify='space-between'>
        <Flex align='center'>
          <LeftOutlined style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)' }} />
          {leftChildren()}
        </Flex>
        <Flex align='center' gap='small'>
          {rightChildren()}
        </Flex>
      </Flex>
    </Header>
  )
}

export default HeaderLayout
