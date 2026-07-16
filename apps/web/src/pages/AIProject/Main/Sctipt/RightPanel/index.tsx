import { Flex, Button, Dropdown, message } from 'antd'
import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import ScriptText from './ScriptText'
import * as api from '@/api/models/aiScript'
import { downloadFromServer, Ext } from '@/utils'
import { ScriptPageList } from '@/api/types/script'
import { downloadTemplateUrl } from '@/api/models/aiScript'
import type { MenuProps } from 'antd'
import ChatUpload from '@/pages/AIProject/Main/Sctipt/Chat/components/ChatUpload'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'

import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
const RightPanel = () => {
  const navigate = useNavigate()
  const { id } = useParams() // 获取路由参数 userId
  const projectId = Number(id)
  const dispatch = useDispatch<Dispatch>()
  const { scriptPageListMap } = useSelector((state: RootState) => state.aiScript)
  const [loading, setLoading] = useState(false)
  const [activeObj, setActive] = useState<{ [k: string]: boolean }>({})
  const handleChoose = useCallback((val: ScriptPageList) => {
    setActive(prev => ({
      // 重置所有键为 false
      ...Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
      // 将最新的键设置为 true
      [val.scriptId]: true,
    }))
  }, [])
  //当前被选中的剧本
  const targetScript = useMemo(() => {
    // 找到键值为 true 的键
    const activeKey = Object.keys(activeObj).find(key => activeObj[key])
    return scriptPageListMap?.data?.find(v => v.scriptId === Number(activeKey))
  }, [scriptPageListMap, activeObj])

  const handleDownloadTemplate = useCallback((event: any, ext: keyof typeof Ext) => {
    event.preventDefault() // 阻止默认行为，例如点击链接不会导航到 href
    event.stopPropagation()
    downloadFromServer(`${downloadTemplateUrl}?ext=${ext}`, `剧本模板.${ext}`)
  }, [])
  const downItems: MenuProps['items'] = [
    // {
    //   key: '1',
    //   label: <span onClick={e => handleDownloadTemplate(e, 'csv')}>csv</span>,
    // },
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
      style={{ padding: '0 24px 24px 24px', overflow: 'hidden', height: '100%', userSelect: 'none' }}>
      <Flex className='header' justify='space-between'>
        <Button type='link' style={{ color: '#000', fontSize: '16px', fontWeight: 500 }}>
          剧本资源
        </Button>
        <Dropdown menu={{ items: downItems }} placement='bottomLeft' arrow={{ pointAtCenter: true }}>
          <Button type='text'>下载模板</Button>
        </Dropdown>
        <ChatUpload customRequest={handleCustomRequest} accept='.md, .csv, .tsv'>
          <Button type='link'>导入剧本</Button>
        </ChatUpload>
      </Flex>
      <Flex className='content' vertical={true} wrap={true} gap={10} style={{ overflow: 'hidden' }} flex={1}>
        <ScriptText handleChoose={handleChoose} activeObj={activeObj}></ScriptText>
      </Flex>

      {scriptPageListMap?.total ? (
        <Button
          loading={loading}
          onClick={handleConfirm}
          disabled={targetScript?.scriptId ? false : true}
          type='primary'
          style={{ width: '100%', margin: '10px 0 88px 0' }}>
          确认并开始镜头设计
        </Button>
      ) : null}
    </Flex>
  )
}
export default RightPanel
