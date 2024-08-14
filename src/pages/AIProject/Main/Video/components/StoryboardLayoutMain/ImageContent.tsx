import { Flex, Image } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect, useState } from 'react'
import { MyContext } from '../..'
import chatGpt from '@/assets/images/chatGpt.png'
import dayjs from 'dayjs'
import { Text2imageMessage, Text2imageMessageOptions } from '@/api/types/video'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ActionBtn from '@/pages/AIProject/components/ActionBtn'
import MessageLayout from './MessageLayout'
const config: {
  key: 'add' | 'refresh'
  value: string
  icon: string
}[] = [
  {
    key: 'add',
    value: '标记为剧本',
    icon: 'add',
  },
  {
    key: 'refresh',
    value: '重新生成',
    icon: 'refresh',
  },
]
const ImageContent = () => {
  const { cdnPath } = useSelector((state: RootState) => state.common.pathConfig)
  const { curShot, projectId } = useContext(MyContext)
  const [loading, setLoading] = useState({})
  const [imageList, setImageList] = useState<Text2imageMessage[]>([])
  const getText2imageHistories = async (shotId: number) => {
    const res = await api.getText2imageHistories({
      shotId,
    })
    setImageList(res.records)
    console.log(res.records)
  }

  useEffect(() => {
    console.log('curShot?.shotId', curShot?.shotId)
    if (!curShot?.shotId) return
    getText2imageHistories(curShot?.shotId)
  }, [curShot?.shotId])
  const imageBtnClick = async (item: Text2imageMessage, option: Text2imageMessageOptions) => {
    console.log('imageBtnClick', item)
    setLoading(prev => ({
      ...prev,
      [item.id]: true,
    }))
    try {
      await api.addText2imageTask({
        shotId: curShot?.shotId!,
        text: item.content!,
        option,
        projectId,
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [item.id]: false,
      }))
    }
  }
  const handleClick = (key: string) => {
    if (key === 'add') {
      console.log('add')
    } else if (key === 'refresh') {
      console.log('refresh')
    }
  }
  return (
    <div>
      {imageList.map(item => {
        return (
          <MessageLayout key={item.id}>
            <Flex vertical={true}>
              <div>{item.content}</div>
              <div>
                <Image src={cdnPath + item.originImgUrl} preview={false}></Image>
              </div>
              <Flex wrap={true} gap={10} style={{ marginTop: '10px' }}>
                {item.options?.length > 0
                  ? item.options?.map(v => {
                      return (
                        <ActionBtn key={v.label} value={v.label} onClick={() => imageBtnClick(item, v)}></ActionBtn>
                      )
                    })
                  : config.map(v => (
                      <ActionBtn
                        key={v.key}
                        value={v.value}
                        icon={v.icon}
                        onClick={() => handleClick(v.key)}></ActionBtn>
                    ))}
              </Flex>
            </Flex>
          </MessageLayout>
        )
      })}
    </div>
  )
}
export default ImageContent
