import { Flex, Button, Dropdown, message } from 'antd'
import { useMemo, useCallback, useState, useRef } from 'react'
import ScriptText from './ScriptText'
import * as api from '@/api/models/aiScript'
import { downloadFromServer, Ext } from '@/utils'
import { ScriptPageList } from '@/api/types/script'
import { downloadTemplateUrl } from '@/api/models/aiScript'
import type { MenuProps } from 'antd'
import ChatUpload from '@/pages/AIProject/Main/Sctipt/Chat/components/ChatUpload'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import IconWidget from '@/components/IconWidget'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
const RightPanel = () => {
  const navigate = useNavigate()
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const dispatch = useDispatch<Dispatch>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scriptPageList } = useSelector((state: RootState) => state.aiScript)
  const [loading, setLoading] = useState(false)
  //当前被选中的剧本
  const targetScript = useMemo(() => {
    return scriptPageList?.find(v => v.actived)
  }, [scriptPageList])
  const handleChoose = useCallback(
    (val: ScriptPageList) => {
      dispatch.aiScript.updateData({
        scriptPageList: scriptPageList.map(item => ({
          ...item, // 保持其他属性不变
          actived: item.scriptId === val.scriptId, // 设置 actived 状态
        })),
      })
    },
    [scriptPageList],
  )
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
      navigate(`/project/${targetScript?.projectId!}/video`)
    } finally {
      setLoading(false)
    }
  }, [targetScript])
  const handleCustomRequest = async (options: any) => {
    await api.uploadScript(projectId, options.file)
    message.success('上传成功')
    dispatch.aiScript.getScriptPageList({
      projectId,
    })
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
          <Button type='link'>导入剧本</Button>
        </ChatUpload>
      </Flex>
      <Flex className='content' vertical={true} wrap={true} gap={10} style={{ overflow: 'hidden' }} flex={1}>
        <Flex style={{ overflow: 'auto', width: '100%' }} ref={scrollRef} id='scrollableDiv' gap={10} vertical={true}>
          {!scriptPageList?.length ? (
            <>
              <Flex vertical={true} align='center' justify='center' style={{ width: '100%' }}>
                <IconWidget name='empty' style={{ maxWidth: '100%', objectFit: 'contain' }} />
                <p>空空如也，快去创造剧本吧~</p>
              </Flex>
            </>
          ) : (
            scriptPageList?.map(v => {
              return <ScriptText key={v.scriptId} data={v} handleChoose={handleChoose}></ScriptText>
            })
          )}
        </Flex>
      </Flex>

      {scriptPageList?.length > 0 && (
        <Button
          loading={loading}
          onClick={handleConfirm}
          disabled={targetScript?.scriptId ? false : true}
          type='primary'
          style={{ width: '100%', marginTop: '10px' }}>
          确认剧本
        </Button>
      )}
    </Flex>
  )
}
export default RightPanel
