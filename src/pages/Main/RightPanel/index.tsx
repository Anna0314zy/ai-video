import { Flex, Button, Space } from 'antd'
import './index.less'
import { useState, useContext, useEffect, useCallback } from 'react'
import ScriptText from './ScriptText'
import * as api from '@/api/models/main'
import { MyContext } from '@/pages/Main'
import { ScriptPageList } from '@/api/type'
const RightPanel = () => {
  const { projectId } = useContext(MyContext)
  const [data, setData] = useState<ScriptPageList[]>([])
  const getList = async () => {
    const res = await api.getPageScript({ projectId })
    setData(res.records)
  }
  useEffect(() => {
    getList()
  }, [])

  const handleChoose = useCallback((val: ScriptPageList) => {
    console.log('val', val)
    setData((prev: ScriptPageList[]) => {
      return prev.map(item => ({
        ...item, // 保持其他属性不变
        actived: item.scriptId === val.scriptId, // 设置 actived 状态
      }))
    })
  }, [])
  return (
    <div className='script-right-panel'>
      <Flex className='header' justify='space-between'>
        <Button type='link' style={{ color: '#000', fontSize: '16px', fontWeight: 500 }}>
          剧本资源
        </Button>
        <Button type='link'>导入剧本</Button>
      </Flex>
      <Flex className='content' vertical={true} wrap={true} gap={10}>
        {data.map(v => {
          return <ScriptText key={v.scriptId} data={v} handleChoose={handleChoose}></ScriptText>
        })}
      </Flex>

      <Button type='primary' style={{ width: '100%', marginTop: '10px' }}>
        确认剧本
      </Button>
    </div>
  )
}
export default RightPanel
