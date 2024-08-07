import Icon from '@/components/IconWidget/AntdIcon'
import { MessageList } from '@/api/type'
interface IProps {
  value: string
  onClick: () => void
  icon: string
}
const ActionBtn = ({ value = '标记为剧本', onClick, icon }: IProps) => {
  return (
    <div onClick={onClick} className='chat-btn'>
      <span style={{ backgroundColor: '#ffff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
        <Icon icon={icon} style={{ paddingRight: '5px' }}></Icon>
        <span>{value}</span>
      </span>
    </div>
  )
}
export default ActionBtn
