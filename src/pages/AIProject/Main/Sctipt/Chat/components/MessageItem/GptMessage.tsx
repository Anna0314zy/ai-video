import { MessageList } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import { Spin } from 'antd'
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
interface IProps {
  messageInfo: MessageList
  md: any
  typeRef?: any
  chatIngText?: string
  chatIng?: boolean
}
const GptMessage = ({ messageInfo, md, chatIngText }: IProps) => {
  const { chatIng } = useSelector((state: RootState) => state.aiScript)
  // 缓存渲染后的 HTML
  const renderedHtml = useMemo(() => md.render(chatIngText || ''), [chatIngText, md])

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
          style={{ display: !chatIng ? 'none' : 'block' }}
          dangerouslySetInnerHTML={{
            __html: renderedHtml,
          }}></div>
      </HeadLayout>
    </div>
  )
}
export default memo(GptMessage)
