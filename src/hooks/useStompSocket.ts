import { message } from 'antd'
import StompSocket from '@/utils/stompSocket'
import { SEND_THOROUGH, TEXT_TO_IMAGE_THOROUGH } from '@/const/socket'
import { useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
const useStompSocket = (
  subscribeThorough: {
    path: string
    callback: Function
  }[],
  sendThorough = SEND_THOROUGH,
) => {
  let stompSocket = useRef<any>(null)
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)

  useEffect(() => {
    stompSocket.current = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: SEND_THOROUGH,
      subscribeThorough: subscribeThorough.map(v => `${v.path}/${accountId}`),
    })
    console.log('>> ws subscribeThorough', subscribeThorough)

    subscribeThorough.forEach(item => {
      stompSocket.current.on(`${item.path}/${accountId}`, (message: any) => {
        console.log(`>> ws onSubscribe ${item.path}`, message)
        item.callback(message)
      })
    })

    return () => {
      stompSocket.current.unsubscribe()
    }
  }, [])
  return {
    stompSocket: stompSocket.current,
  }
}
export default useStompSocket
