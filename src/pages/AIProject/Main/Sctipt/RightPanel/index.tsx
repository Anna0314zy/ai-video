import { Flex, Button, Dropdown, message, Space } from 'antd'
import { useMemo, useContext, useCallback, useState, useRef } from 'react'
import ScriptText from './ScriptText'
import * as api from '@/api/models/aiScript'
import { MyContext } from '@/pages/AIProject/Main/Sctipt/MyContext'
import { downloadFromServer, Ext } from '@/utils'
import { ScriptPageList } from '@/api/types/script'
import { downloadTemplateUrl } from '@/api/models/aiScript'
import type { MenuProps } from 'antd'
import ChatUpload from '@/pages/AIProject/Main/Sctipt/Chat/components/ChatUpload'
import Styles from './index.module.less'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import IconWidget from '@/components/IconWidget'
const RightPanel = () => {
  const dispatch = useDispatch<Dispatch>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scriptPageList } = useSelector((state: RootState) => state.aiScript)
  const { projectId } = useContext(MyContext)
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
      dispatch.aiScript.updateData({
        scriptPageList: scriptPageList.map(item => {
          if (item.scriptId === targetScript?.scriptId) {
            return Object.assign({}, item, {
              isFinal: 1,
            })
          }
          return Object.assign({}, item, {
            isFinal: 0,
          })
        }),
      })
      dispatch.aiScript.getProjectDetail({
        projectId,
      })
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
        <div style={{ overflow: 'auto', width: '100%' }} ref={scrollRef} id='scrollableDiv'>
          <Space style={{ display: 'flex', flexDirection: 'column' }} className={Styles['space-item']}>
            {!scriptPageList?.length ? (
              <>
                <IconWidget name='empty' />
                <p>空空如也，快去创造剧本吧~</p>
              </>
            ) : (
              scriptPageList?.map(v => {
                return <ScriptText key={v.scriptId} data={v} handleChoose={handleChoose}></ScriptText>
              })
            )}
          </Space>
        </div>
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
