import { Image } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { ChatMessageList, EnumUploadType } from '@/api/types/video'
// 配置颜色
const MaterialContent = ({ data }: { data: ChatMessageList }) => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  if (data.originUrl) {
    if (data.type === EnumUploadType['IMAGE']) {
      return (
        <Image src={cdnPath + (data.compressUrl || data.originUrl)} preview={false} style={{ width: '80%' }}></Image>
      )
    } else if (data.type === EnumUploadType['VIDEO']) {
      return (
        <video controls style={{ width: '80%' }}>
          <source src={cdnPath + data.compressUrl} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      )
    } else if (data.type === EnumUploadType['AUDIO']) {
      return (
        <audio controls style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
          <source src={cdnPath + data.originUrl} type='audio/mpeg' />
          Your browser does not support the audio element.
        </audio>
      )
    }
  }
}
export default MaterialContent
