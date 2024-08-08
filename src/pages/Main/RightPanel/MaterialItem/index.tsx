import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget'
import { MoreOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { ScriptPageList } from '@/api/type'
import { Flex, Space, Button, Dropdown, message } from 'antd'
import { useCallback, useContext, useRef } from 'react'
import classNames from 'classnames'
import * as api from '@/api/models/main'
import { downloadFromServer } from '@/utils'
import type { MenuProps } from 'antd'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { MyContext } from '@/pages/Main'
import ScriptPreview from '../ScriptPreview'
interface IMaterialItem {
  data: ScriptPageList // 素材数据
  icon?: string // 素材icon
  actived?: boolean // 选中状态
  handleClick: (val: ScriptPageList) => void
}
export default (props: IMaterialItem) => {
  const { getScriptPageList, disabled } = useContext(MyContext)
  const { data } = props
  const previewRef = useRef<{
    open: (val: string) => void
  }>(null)
  const handlePreview = useCallback(async () => {
    console.log('预览')

    const res = await api.previewScript({
      scriptId: data.scriptId,
    })
    previewRef.current?.open(res)
  }, [])

  const handleDel = useCallback(async () => {
    console.log('删除', data)
    if (disabled) return
    await api.deleteScript({
      scriptId: data.scriptId,
      projectId: data.projectId,
    })
    message.success('删除成功')
    getScriptPageList()
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
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Flex onClick={handlePreview}>
          <AntdIcon style={{ fontSize: '20px' }} icon='preview'></AntdIcon>
          <span style={{ marginLeft: '8px' }}>预览</span>
        </Flex>
      ),
    },
    {
      key: '2',
      label: (
        <Flex onClick={handleDel}>
          <AntdIcon style={{ fontSize: '20px' }} icon='delete'></AntdIcon>
          <span style={{ marginLeft: '8px', cursor: !disabled ? 'pointer' : 'not-allowed' }}>删除</span>
        </Flex>
      ),
    },
  ]
  // 下载
  const handleDownload = useCallback((ext: string = 'md') => {
    console.log('删除', data)
    const url = `${import.meta.env.VITE_API_SERVER}/api/text/v1/downloadScript?scriptId=${data.scriptId}&ext=${ext}`
    downloadFromServer(url, `${data.scriptStyle}-${data.scriptId}.${ext}`)
  }, [])

  return (
    <>
      <Flex
        className={classNames(Styles['material-item'], {
          [Styles.actived]: data.actived || data.isFinal,
        })}
        onClick={() => props.handleClick(props.data)}>
        <IconWidget
          className='material-icon'
          name={props.icon}
          width={24}
          height={24}
          style={{ marginRight: '10px' }}
        />
        <Flex className='material-content' align='flex-start' flex={1} vertical={true}>
          <span className='material-content'>
            {data?.scriptStyle}-{data.scriptId}
          </span>
          <span>{data.modified}</span>
        </Flex>
        <div className='material-item-right'>
          <Space>
            <Dropdown menu={{ items: downItems }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
              <Button type='link' icon={<ArrowDownOutlined />} className={Styles['btn']}></Button>
            </Dropdown>

            <Dropdown menu={{ items }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
              <Button type='link' className={Styles.btn} icon={<MoreOutlined className='material-more' />}></Button>
            </Dropdown>
          </Space>
        </div>
      </Flex>
      <ScriptPreview ref={previewRef} handleDownload={handleDownload} handleDel={handleDel} disabled={disabled} />
    </>
  )
}
