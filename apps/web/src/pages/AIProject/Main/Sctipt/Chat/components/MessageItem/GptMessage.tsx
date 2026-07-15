import { MessageList } from '@/api/types/script'
import HeadLayout from './messageHeadLayout'
import { Flex, Spin } from 'antd'
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import classNames from 'classnames'
import Style from './index.module.less'
import { normalizeMarkdownSource } from '@/utils'
interface IProps {
  messageInfo: MessageList
  md: any
  typeRef?: any
  chatIngText?: string
  chatIng?: boolean
}
const GptMessage = ({ messageInfo, md, chatIngText }: IProps) => {
  const { chatIng } = useSelector((state: RootState) => state.aiScript)
  const renderedHtml = useMemo(() => {
    return md.render(normalizeMarkdownSource(typeof chatIngText === 'string' ? chatIngText : ''))
  }, [md, chatIngText])

  return (
    <div style={{ display: messageInfo?.requesting ? 'block' : 'none' }}>
      <HeadLayout messageInfo={messageInfo || {}}>
        <Flex vertical={true} className={classNames(Style.content, Style['messageInfo-item-cont'], Style[messageInfo.role])}>
          {!chatIngText ? (
            <Spin size='small' />
          ) : null}
          <div
            id={String(messageInfo.id)}
            className={Style['message-content-inner']}
            style={{ display: !chatIng ? 'none' : 'block', textAlign: 'left' }}
            dangerouslySetInnerHTML={{
              __html: renderedHtml,
            }}
          />
        </Flex>
      </HeadLayout>
    </div>
  )
}
export default memo(GptMessage)
