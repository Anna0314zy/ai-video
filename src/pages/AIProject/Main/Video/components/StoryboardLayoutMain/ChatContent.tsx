import { Layout } from 'antd'
import { Flex, Image } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect, useState } from 'react'
import { ChatMessageList, EnumUploadType, Text2imageMessageOptions } from '@/api/types/video'

import { MyContext } from '../..'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
import MaterialContent from './MaterialContent'
import useControlMsg from './hooks/useControlMsg'
const config: {
  key: 'add' | 'refresh'
  value: string
  icon: string
}[] = [
  {
    key: 'add',
    value: '标记为剧本',
    icon: 'add',
  },
  {
    key: 'refresh',
    value: '重新生成',
    icon: 'refresh',
  },
]
const style: React.CSSProperties = {
  backgroundColor: '#F2F3F7',
  flex: '1',
  overflow: 'auto',
}
const ChatContent = () => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  const { curShot, projectId, selectedType } = useContext(MyContext)
  const [loading, setLoading] = useState({})
  const { messageList, getMessageList, addChatTask } = useControlMsg()

  useEffect(() => {
    if (!curShot?.shotId) return
    getMessageList(selectedType, curShot?.shotId)
  }, [curShot?.shotId, selectedType])
  const imageBtnClick = async (item: ChatMessageList, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.taskId]: true,
    }))
    try {
      await addChatTask({
        shotId: curShot?.shotId!,
        option,
        projectId,
        requestLogId: item.id,
        type: EnumUploadType['IMAGE'],
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [item.taskId]: false,
      }))
    }
  }
  const handleClick = (key: string) => {
    if (key === 'add') {
      console.log('add')
    } else if (key === 'refresh') {
      console.log('refresh')
    }
  }
  return (
    <Layout.Content style={style}>
      <div>
        {messageList.map(item => {
          return (
            <MessageLayout key={item.taskId}>
              <Flex vertical={true}>
                <div>{item.content}</div>
                <MaterialContent data={item} />
                <Flex wrap={true} gap={10} style={{ marginTop: '10px' }} className='btns'>
                  {item.options?.map(v => {
                    return <ActionBtn key={v.label} value={v.label} onClick={() => imageBtnClick(item, v)}></ActionBtn>
                  })}

                  {config.map(v => (
                    <ActionBtn key={v.key} value={v.value} icon={v.icon} onClick={() => handleClick(v.key)}></ActionBtn>
                  ))}
                </Flex>
              </Flex>
            </MessageLayout>
          )
        })}
      </div>
    </Layout.Content>
  )
}
export default ChatContent
