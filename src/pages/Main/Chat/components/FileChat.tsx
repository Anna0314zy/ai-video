import { MessageList } from '@/api/type'
import IconWidget from '@/components/IconWidget'

const FileChat = ({ messageInfo }: { messageInfo: MessageList }) => {
  if (!messageInfo?.attachmentFileInfo?.fileId) return
  return (
    <div className='file-chat'>
      <span className='file-chat-content'>
        <IconWidget name='excel' style={{ width: 22, paddingRight: '8px' }} />
        {messageInfo?.attachmentFileInfo.fileName}
      </span>
    </div>
  )
}
export default FileChat
