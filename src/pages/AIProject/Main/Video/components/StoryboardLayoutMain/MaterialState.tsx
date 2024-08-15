import { Flex } from 'antd'
import { ChatMessageList, TaskState } from '@/api/types/video'
import AntdIcon from '@/components/IconWidget/AntdIcon'
// 配置颜色
const MaterialState = ({ data }: { data: ChatMessageList }) => {
  // 对state 进行解释
  if (['Completed'].includes(data.taskState)) return null
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
      {!['Completed', 'Failed'].includes(data.taskState) ? (
        <AntdIcon icon='loading' style={{ animation: 'spin 1s linear infinite' }}></AntdIcon>
      ) : null}

      <span style={{ paddingLeft: '15px' }}> {TaskState[data.taskState]}</span>
    </Flex>
  )
}
export default MaterialState
