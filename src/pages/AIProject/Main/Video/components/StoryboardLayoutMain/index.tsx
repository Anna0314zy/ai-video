import { Layout, Flex } from 'antd'
import ChatContent from './ChatContent'
import ChatControl from './ChatControl'
import { useContext, useState } from 'react'
import { MyContext } from '../../MyContext'
import { ChatMessageList, Text2imageMessageOptions } from '@/api/types/video'
import useControlMsg from '../../useControlMsg'
const contentStyle: React.CSSProperties = {
  // textAlign: 'center',
  height: '100%',
  color: '#fff',
  backgroundColor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}
export default () => {
  return (
    <Flex vertical={true} style={contentStyle} flex={1}>
      <ChatContent />
      <ChatControl />
    </Flex>
  )
}
