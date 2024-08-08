import { Flex, Button, Dropdown, message, Space } from 'antd'
import { useMemo, useContext, useCallback, useState } from 'react'
import ScriptText from './ScriptText'
import * as api from '@/api/models/main'
import { MyContext } from '@/pages/Main'
import { downloadFromServer, Ext } from '@/utils'
import { ScriptPageList } from '@/api/type'
import { downloadTemplateUrl } from '@/api/models/main'
import type { MenuProps } from 'antd'
import ChatUpload from '@/pages/Main/Chat/components/ChatUpload'
const RightPanel = () => {
  const { scriptPageList, disabled, setScriptPageList, projectId, getScriptPageList } = useContext(MyContext)
  const [loading, setLoading] = useState(false)
  //当前被选中的剧本
  const targetScript = useMemo(() => {
    return scriptPageList?.find(v => v.actived)
  }, [scriptPageList])
  const handleChoose = useCallback((val: ScriptPageList) => {
    console.log('val', val)
    setScriptPageList((prev: ScriptPageList[]) => {
      return prev.map(item => ({
        ...item, // 保持其他属性不变
        actived: item.scriptId === val.scriptId, // 设置 actived 状态
      }))
    })
  }, [])
  const handleDownloadTemplate = useCallback((event: any, ext: keyof typeof Ext) => {
    event.preventDefault() // 阻止默认行为，例如点击链接不会导航到 href
    event.stopPropagation()
    downloadFromServer(`${downloadTemplateUrl}?ext=${ext}`, `剧本模板.${ext}`)
  }, [])
  const downItems: MenuProps['items'] = [
    {
      key: '1',
      label: <span onClick={e => handleDownloadTemplate(e, 'xlsx')}>xlsx</span>,
    },
    {
      key: '2',
      label: <span onClick={e => handleDownloadTemplate(e, 'md')}>md</span>,
    },
  ]

  const handleConfirm = useCallback(async () => {
    setLoading(true)
    try {
      await api.confirmScript({
        projectId: targetScript?.projectId!,
        scriptId: targetScript?.scriptId!,
      })
      message.success('确认成功')
    } finally {
      setLoading(false)
    }
  }, [targetScript])
  const handleCustomRequest = async (options: any) => {
    await api.uploadScript(projectId, options.file)
    message.success('上传成功')
    getScriptPageList()
  }
  return (
    <Flex
      className='script-right-panel'
      vertical={true}
      style={{ padding: '0 24px 24px 24px', overflow: 'hidden', maxHeight: '100%', userSelect: 'none' }}>
      <Flex className='header' justify='space-between'>
        <Button type='link' style={{ color: '#000', fontSize: '16px', fontWeight: 500 }}>
          剧本资源
        </Button>
        <Dropdown menu={{ items: downItems }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
          <Button type='text'>下载模板</Button>
        </Dropdown>
        <ChatUpload customRequest={handleCustomRequest} accept='.md, .xlsx, .docx'>
          <Button type='link' disabled={disabled}>
            导入剧本
          </Button>
        </ChatUpload>
      </Flex>
      <Flex className='content' vertical={true} wrap={true} gap={10} style={{ overflow: 'hidden' }} flex={1}>
        <div style={{ overflow: 'auto' }}>
          <Space style={{ display: 'flex', flexDirection: 'column' }}>
            {scriptPageList?.map(v => {
              return <ScriptText key={v.scriptId} data={v} handleChoose={handleChoose}></ScriptText>
            })}
          </Space>
        </div>
      </Flex>

      <Button
        loading={loading}
        onClick={handleConfirm}
        disabled={disabled ? disabled : targetScript?.scriptId ? false : true}
        type='primary'
        style={{ width: '100%', marginTop: '10px' }}>
        确认剧本
      </Button>
    </Flex>
  )
}
export default RightPanel
