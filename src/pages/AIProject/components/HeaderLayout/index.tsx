import { Layout, Flex } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const { Header } = Layout
const headerStyle: React.CSSProperties = {
  color: '#fff',
  height: 60,
  padding: '0 24px',
  lineHeight: '64px',
  backgroundColor: 'rgba(255, 255, 255, 1)',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}
interface headerProps {
  leftChildren: (project: any, showHeaderTips?: boolean) => React.ReactNode
  rightChildren: (project: any) => React.ReactNode
  showHeaderTips?: boolean
}

const HeaderLayout = (props: headerProps) => {
  const { leftChildren, rightChildren } = props
  const { currentProjectDetail } = useSelector((state: RootState) => state.aiScript)
  return (
    <Header style={headerStyle}>
      <Flex style={{ height: '100%', width: '100%' }} align='center' justify='space-between'>
        <Flex align='center'>
          <LeftOutlined
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              const returnUrl = params.get('returnUrl')
              if (returnUrl && window.location.href.includes('/script')) {
                window.location.href = returnUrl
              }
            }}
            style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)' }}
          />
          {leftChildren(currentProjectDetail, props.showHeaderTips)}
          <span style={{ color: '#000', fontSize: '14px', fontWeight: 700 }}>
            {window.location.pathname?.split('/')?.[2] === 'test' && '(测试环境)'}
          </span>
        </Flex>
        <Flex align='center' gap='small'>
          {rightChildren(currentProjectDetail)}
        </Flex>
      </Flex>
    </Header>
  )
}

export default HeaderLayout
