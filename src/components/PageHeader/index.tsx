import { Button, Tag, Layout, Col, Row, Flex } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import confirm from '@/assets/images/img_confirm.png'
import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget'
import { useSearchParams } from 'react-router-dom'

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

interface IPageHeader {
    icon?:string

}

export default (props: any) => {
  const [searchParams] = useSearchParams()
  const projectName = searchParams.get('projectName')
  const type = searchParams.get('type')

  return (
    <Layout.Header className={Styles['page-header-layout']}>
      <Flex className='page-header-content' align='center' justify='space-between'>
        <Flex align='center'>
          <LeftOutlined style={{ fontSize: 16, color: 'rgba(87, 87, 102, 1)' }} />
          <IconWidget name={props.icon} style={{ width: 22, marginLeft: 12 }} />
          <span className="project-name" style={{ fontWeight: 500, fontSize: 20, color: '#292933' }}>《{projectName}》</span>
          <span className='tip-shu'> | </span>
          <span className='tip-text'>{Number(type) === 1 ? '剧本设计' : '镜头设计'}</span>
          {props.status && <span className='project-status'>{props.status}</span>}
        </Flex>
        <Flex align='center' gap='small'>
          {props.children}
        </Flex>
      </Flex>
    </Layout.Header>
  )
}
