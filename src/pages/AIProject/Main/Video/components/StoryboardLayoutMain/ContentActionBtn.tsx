import { message, Flex, Tag } from 'antd'
import * as api from '@/api/models/aiVideo'
import { useContext, useMemo, useState } from 'react'
import { ChatMessageList, ResourceTypeMap } from '@/api/types/video'
import { MyContext } from '../../MyContext'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
const ContentActionBtn = ({ item }: { item: ChatMessageList }) => {
  const dispatch = useDispatch<Dispatch>()
  const { currentShotId } = useSelector((state: RootState) => state.aiVideo)
  const { reinstateTask, updateMessage } = useContext(MyContext)
  // 记录按钮的状态
  const [btnLoading, setBtnLoading] = useState<{
    [key: string]: {
      [key: string]: boolean
    }
  }>()
  const handleClick = async (key: string, item: ChatMessageList) => {
    setBtnLoading({
      [item.taskId]: {
        [key]: true,
      },
    })
    try {
      if (key === 'add') {
        console.log('add')
        if (!item.historyId) return
        const { resourceId, name } = await api.addResource({
          historyId: item.historyId,
          type: item.type,
        })
        updateMessage(
          {
            ...item,
            resourceId,
            resourceName: name,
          },
          false,
        )
        dispatch.aiVideo.getResourceList({
          shotId: currentShotId,
          type: item.type,
          pageIndex: 1,
        })
        message.success(`${ResourceTypeMap[item.type]}标记成功`)
      } else if (key === 'refresh') {
        console.log('refresh')
        await reinstateTask(item.taskId)
      }
    } finally {
      setBtnLoading({
        [item.taskId]: {
          [key]: false,
        },
      })
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
    let show = !['Queued', 'Processing'].includes(item.taskState)

    if (item.type === 'image') {
      show = Boolean(item.isTrimming)
    }

    return [
      {
        key: 'add',
        value: `标记为${ResourceTypeMap[item.type]}`,
        icon: 'add',
        disabled: !item.originUrl || item.taskState === 'Failed',
        show: show,
      },
      {
        key: 'refresh',
        value: '重新生成',
        icon: 'refresh',
        disabled: ['Queued', 'Processing'].includes(item.taskState) || item.taskState === 'Failed',
        show: show,
      },
    ]
  }, [item])
  const showData = useMemo(() => {
    return item.resourceId ? config.slice(1) : config
  }, [item])
  return (
    <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
      {item.resourceId ? (
        <Tag style={{ color: '#FF7A2F' }} color='rgba(254, 126, 7, 0.1)' icon={<AntdIcon icon='script' />}>
          {item.resourceName || ResourceTypeMap[item.type]}
        </Tag>
      ) : null}
      {showData.map(
        v =>
          v.show && (
            <ActionBtn
              disabled={v.disabled || btnLoading?.[item.taskId]?.[v.key]}
              loading={btnLoading?.[item.taskId]?.[v.key]}
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
