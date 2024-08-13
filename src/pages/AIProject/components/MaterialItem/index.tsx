import { useCallback, useContext, useRef } from 'react'
import { MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Flex, Button, Dropdown, message } from 'antd'
import classNames from 'classnames'
import IconWidget from '@/components/IconWidget'
import { ScriptPageList } from '@/api/types/script'
import * as api from '@/api/models/main'
import { downloadFromServer } from '@/utils'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { MyContext } from '@/pages/AIProject/Main/Sctipt'
import ScriptPreview from '../../Main/Sctipt/RightPanel/ScriptPreview'
import DownloadScript from './DownloadScript'
import Styles from './index.module.less'

interface IMaterialItem {
  data: ScriptPageList // 素材数据
  icon?: string // 素材icon
  actived?: boolean // 选中状态
  onChange: (val: ScriptPageList) => void
}
export default (props: IMaterialItem) => {
  const { getScriptPageList } = useContext(MyContext)
  const { data, actived, onChange } = props
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
    await api.deleteScript({
      scriptId: data.scriptId,
      projectId: data.projectId,
    })
    message.success('删除成功')
    getScriptPageList()
  }, [])
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
          <span style={{ marginLeft: '8px' }}>删除</span>
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
          [Styles.actived]: data.actived || actived,
        })}
        onClick={() => onChange(data)}>
        {data.isFinal ? <AntdIcon icon='checkCircle' classname={Styles['checkCircle']}></AntdIcon> : null}
        <IconWidget
          className='material-icon'
          name={props.icon}
          width={24}
          height={24}
          style={{ marginRight: '10px' }}
        />
        <Flex className={Styles['material-content']} align='flex-start' flex={1} vertical={true}>
          <div className={Styles['material-content-name']}>{data.name}</div>
          <div>{data.modified}</div>
        </Flex>
        <div className='material-item-right'>
          <DownloadScript data={data} />
          <Dropdown menu={{ items }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
            <Button type='link' className={Styles.btn} icon={<MoreOutlined className='material-more' />}></Button>
          </Dropdown>
        </div>
      </Flex>
      <ScriptPreview ref={previewRef} handleDownload={handleDownload} handleDel={handleDel} data={props.data} />
    </>
  )
}
