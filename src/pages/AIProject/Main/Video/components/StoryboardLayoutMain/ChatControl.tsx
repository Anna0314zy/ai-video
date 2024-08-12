import { Layout } from 'antd'
import * as api from '@/api/models/video'
import { useContext, useEffect } from 'react'
import { MyContext } from '../..'
const style: React.CSSProperties = {
  backgroundColor: '#fff',
}
const ChatControl = () => {
  const { curShot } = useContext(MyContext)
  const getPromptConfig = async () => {
    if (!curShot) return
    const res = await api.getPromptConfig(curShot?.shotId!)
    console.log('res', res)
  }
  useEffect(() => {
    getPromptConfig()
  }, [curShot])
  return <span></span>
}
export default ChatControl
