import { Flex, Image } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { ChatMessageList, EnumUploadType, TaskState } from '@/api/types/video'
import AntdIcon from '@/components/IconWidget/AntdIcon'
// 配置颜色
const MaterialContent = ({ data }: { data: ChatMessageList }) => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  if (data.type === EnumUploadType['IMAGE'] && data.originImgUrl) {
    return <Image src={cdnPath + data.originImgUrl} preview={false}></Image>
  } else if (data.type === EnumUploadType['VIDEO'] && data.originImgUrl) {
    return <video src={cdnPath + data.originImgUrl}></video>
  } else if (data.type === EnumUploadType['AUDIO'] && data.originImgUrl) {
    return <audio src={cdnPath + data.originImgUrl}></audio>
  }

  // 对state 进行解释
  return (
    <Flex
      align='center'
      justify='flex-start'
      style={{
        backgroundColor: data.state === 'Failed' ? '#FFCCC7' : '#B7EB8F',
        height: '30px',
        paddingLeft: '10px',
        borderRadius: '8px',
      }}>
      {!['Completed', 'Failed'].includes(data.state) ? (
        <AntdIcon icon='loading' style={{ animation: 'spin 1s linear infinite' }}></AntdIcon>
      ) : null}

      <span style={{ paddingLeft: '15px' }}> {TaskState[data.state]}</span>
    </Flex>
  )
}
export default MaterialContent
