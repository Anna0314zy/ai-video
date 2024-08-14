import { Flex, Image } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { ChatMessageList, EnumUploadType } from '@/api/types/video'
const MaterialContent = ({ data }: { data: ChatMessageList }) => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  if (data.type === EnumUploadType['IMAGE']) {
    return <Image src={cdnPath + data.originImgUrl} preview={false}></Image>
  }
  return null
}
export default MaterialContent
