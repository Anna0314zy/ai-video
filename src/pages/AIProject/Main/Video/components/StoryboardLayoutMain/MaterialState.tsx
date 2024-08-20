import { Flex } from 'antd'
import { ChatMessageList, TaskState } from '@/api/types/video'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import { useState, useContext } from 'react'
import { MyContext } from '../../MyContext'
// 配置颜色
const MaterialState = ({ data }: { data: ChatMessageList }) => {
  const [loading, setLoading] = useState(false)
  const { reinstateTask, updateMessage } = useContext(MyContext)
  // 对state 进行解释
  if (['Completed'].includes(data.taskState)) return null
  const onClick = async () => {
    setLoading(true)
    try {
      await reinstateTask(data.taskId)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Flex
      align='center'
      justify='flex-start'
      style={{
        backgroundColor: data.taskState === 'Failed' ? '#FFCCC7' : '#B7EB8F',
        height: '30px',
        paddingLeft: '10px',
        borderRadius: '8px',
        margin: '5px 0',
      }}>
      <Flex justify='space-between' style={{ width: '100%', paddingRight: '20px' }}>
        <div>
          {!['Completed', 'Failed'].includes(data.taskState) ? (
            <AntdIcon icon='loading' style={{ animation: 'spin 1s linear infinite' }}></AntdIcon>
          ) : null}
          <span style={{ paddingLeft: '15px' }}> {TaskState[data.taskState]}</span>
        </div>
        {data.taskState === 'Failed' && (
          <ActionBtn
            disabled={loading}
            loading={loading}
            value={'再试一次'}
            icon={'refresh'}
            style={{ backgroundColor: 'transparent' }}
            onClick={onClick}></ActionBtn>
        )}
      </Flex>
    </Flex>
  )
}
export default MaterialState
