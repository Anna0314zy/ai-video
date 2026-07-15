import { MessageList } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import { Spin } from 'antd'
import { memo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
interface IProps {
  messageInfo: MessageList
  typeRef?: any
  chatIngText?: string
  chatIng?: boolean
}
const GptMessage = ({ messageInfo, chatIngText }: IProps) => {
  const { chatIng } = useSelector((state: RootState) => state.aiScript)

  return (
    <div style={{ display: messageInfo?.requesting ? 'block' : 'none' }}>
      <HeadLayout messageInfo={messageInfo || {}}>
        {!chatIngText ? (
          <div>
            <Spin size='small' />
          </div>
        ) : null}
        <div
          id={String(messageInfo.id)}
          style={{ display: !chatIng ? 'none' : 'block', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
          {chatIngText}
        </div>
      </HeadLayout>
    </div>
  )
}
export default memo(GptMessage)
