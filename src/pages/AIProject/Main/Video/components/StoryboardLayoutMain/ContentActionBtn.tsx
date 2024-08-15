import { message, Flex } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useMemo } from 'react'
import { ChatMessageList, ResourceTypeMap } from '@/api/types/video'
import { MyContext } from '../../MyContext'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'

const ContentActionBtn = ({ item }: { item: ChatMessageList }) => {
  const { reinstateTask } = useContext(MyContext)
  const handleClick = async (key: string, item: ChatMessageList) => {
    if (key === 'add') {
      console.log('add')
      if (!item.historyId) return
      await api.addResource({
        historyId: item.historyId,
        type: item.type,
      })
      message.success(`${ResourceTypeMap[item.type]}标记成功`)
    } else if (key === 'refresh') {
      console.log('refresh')
      if (!item.historyId) return
      reinstateTask(item.historyId, item.type)
    }
  }
  const config: {
    key: 'add' | 'refresh'
    value: string
    icon: string
    disabled?: boolean
    show: boolean
  }[] = useMemo(() => {
    // isTrimming
    const show = !['Queued', 'Processing'].includes(item.taskState)
    return [
      {
        key: 'add',
        value: `标记为${ResourceTypeMap[item.type]}`,
        icon: 'add',
        disabled: !item.originUrl,
        show: show,
      },
      {
        key: 'refresh',
        value: '重新生成',
        icon: 'refresh',
        disabled: ['Queued', 'Processing'].includes(item.taskState),
        show: !['Queued', 'Processing'].includes(item.taskState),
      },
    ]
  }, [item])
  return (
    <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
      {config.map(
        v =>
          v.show && (
            <ActionBtn
              disabled={v.disabled}
              key={v.key}
              value={v.value}
              icon={v.icon}
              onClick={() => handleClick(v.key, item)}></ActionBtn>
          ),
      )}
    </Flex>
  )
}
export default ContentActionBtn
