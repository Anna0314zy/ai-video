import Icon from '@/components/IconWidget/AntdIcon'
import { Button } from 'antd'
interface IProps {
  value: string
  onClick: () => void
  icon?: string
  loading?: boolean
  disabled?: boolean
}
const ActionBtn = ({ value = '标记为剧本', onClick, icon, loading, disabled }: IProps) => {
  return (
    <div onClick={onClick} className='chat-btn'>
      <span className='chat-btn-bg'>
        {icon ? <Icon icon={icon} style={{ paddingRight: '5px' }}></Icon> : null}
        <Button disabled={disabled} loading={loading} type='link' style={{ height: 'auto', padding: 0, color: '#000' }}>
          {value}
        </Button>
      </span>
    </div>
  )
}
export default ActionBtn
