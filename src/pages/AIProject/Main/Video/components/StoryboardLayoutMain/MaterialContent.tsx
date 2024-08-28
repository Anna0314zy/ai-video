import { Image } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { ChatMessageList, EnumUploadType } from '@/api/types/video'
// 配置颜色
const MaterialContent = ({ data }: { data: ChatMessageList }) => {
  console.log('%c 🚀 ~ [ data ]-7', 'font-size:14px; background:green; color:#fff;', data)
  // const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  if (data.originUrl) {
    if (data.type === EnumUploadType['IMAGE']) {
      return <Image src={data.cosUrl} preview={false} style={{ width: '80%' }}></Image>
    } else if (data.type === EnumUploadType['VIDEO']) {
      return (
        <video controls preload='auto' style={{ width: '80%' }}>
          <source src={data.cosUrl} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      )
    } else if (data.type === EnumUploadType['AUDIO']) {
      return (
        <audio controls style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
          <source src={data.cosUrl} type='audio/mpeg' />
          Your browser does not support the audio element.
        </audio>
      )
    }
  }
}
export default MaterialContent
