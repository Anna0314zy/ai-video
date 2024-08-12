import { ScriptPageList } from '@/api/type'
import { Flex, Space, Button, Dropdown, message } from 'antd'
import { MoreOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useCallback, useContext, useRef } from 'react'
import type { MenuProps } from 'antd'
import { downloadFromServer } from '@/utils'
import Styles from './index.module.less'
const DownloadScript = ({ data, children }: { data: ScriptPageList; children?: React.ReactNode }) => {
  const handleDownload = useCallback((ext: string = 'md') => {
    console.log('删除', data)
    const url = `${import.meta.env.VITE_API_SERVER}/api/text/v1/downloadScript?scriptId=${data.scriptId}&ext=${ext}`
    downloadFromServer(url, `${data.name}.${ext}`)
  }, [])
  const downItems: MenuProps['items'] = [
    {
      key: '1',
      label: <span onClick={() => handleDownload('xlsx')}>xlsx</span>,
    },
    {
      key: '2',
      label: <span onClick={() => handleDownload('md')}>md</span>,
    },
  ]
  return (
    <Dropdown menu={{ items: downItems }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
      {children ? children : <Button type='link' icon={<ArrowDownOutlined />} className={Styles['btn']}></Button>}
    </Dropdown>
  )
}

export default DownloadScript
