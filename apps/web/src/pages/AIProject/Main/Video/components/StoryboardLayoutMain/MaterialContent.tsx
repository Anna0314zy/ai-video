import { Image } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { getQiniuObjectUrl } from '@/utils'
import { ChatMessageList, EnumUploadType } from '@/api/types/video'
// 配置颜色
const MaterialContent = ({ data }: { data: ChatMessageList }) => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  if (data.originUrl) {
    if (data.type === EnumUploadType['IMAGE']) {
      return (
        <Image
          src={getQiniuObjectUrl(data.compressUrl || data.originUrl)}
          preview={{
            src: getQiniuObjectUrl(data.originUrl),
          }}></Image>
      )
    } else if (data.type === EnumUploadType['VIDEO']) {
      return (
        <video controls preload='auto' style={{ width: '100%' }}>
          <source src={getQiniuObjectUrl(data.compressUrl || '')} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      )
    } else if (data.type === EnumUploadType['AUDIO']) {
      return (
        <audio controls style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
          <source src={getQiniuObjectUrl(data.originUrl)} type='audio/mpeg' />
          Your browser does not support the audio element.
        </audio>
      )
    }
  }
}
export default MaterialContent
