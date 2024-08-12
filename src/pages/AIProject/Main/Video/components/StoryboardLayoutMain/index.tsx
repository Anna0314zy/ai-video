import { Layout } from 'antd'
import ChatContent from './ChatContent'
import ChatControl from './ChatControl'
import { useContext, useEffect } from 'react'
import { MyContext } from '../..'
const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  height: '100%',
  color: '#fff',
  backgroundColor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
}
export default () => {
  const { curShot } = useContext(MyContext)
  // 需要知道当前到了哪个阶段

  return (
    <Layout.Content className='page-storyboard-main' style={{ height: '100%' }}>
      <ChatContent />
      <ChatControl />
    </Layout.Content>
  )
}
