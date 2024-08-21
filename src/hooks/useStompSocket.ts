import { message } from 'antd'
import StompSocket from '@/utils/stompSocket'
import { SEND_THOROUGH } from '@/const/socket'
import { useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
const useStompSocket = (
  subscribeThorough: {
    path: string
    callback: Function
  }[],
  sendThorough = SEND_THOROUGH,
) => {
  // let stompSocket = useRef<any>(null)
  const [stompSocket, setStom] = useState<any>()
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)

  useEffect(() => {
    const stomp = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: SEND_THOROUGH,
      subscribeThorough: subscribeThorough.map(v => `${v.path}/${accountId}`),
    })
    console.log('>> ws subscribeThorough', subscribeThorough)

    subscribeThorough.forEach(item => {
      stomp.on(`${item.path}/${accountId}`, (message: any) => {
        console.log(`>> ws onSubscribe ${item.path}`, message)
        item.callback(message)
      })
    })
    console.log('stompSocket-------', stomp)
    setStom(stomp)

    return () => {
      subscribeThorough.forEach(item => {
        stomp.unsubscribe(item.path)
      })
    }
  }, [])
  return {
    stompSocket,
  }
}
export default useStompSocket
