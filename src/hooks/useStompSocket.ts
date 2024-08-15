import { message } from 'antd'
import StompSocket from '@/utils/stompSocket'
import { SEND_THOROUGH, TEXT_TO_IMAGE_THOROUGH } from '@/const/socket'
import { useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
const useStompSocket = (
  subscribeThorough = TEXT_TO_IMAGE_THOROUGH,
  callback: Function,
  sendThorough = SEND_THOROUGH,
) => {
  let stompSocket = useRef<any>(null)
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)

  useEffect(() => {
    if (!accountId) return
    stompSocket.current = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: SEND_THOROUGH,
      subscribeThorough: `${subscribeThorough}/${accountId}`,
    })
    console.log('subscribeThorough', `${TEXT_TO_IMAGE_THOROUGH}/${accountId}`)
    stompSocket.current.on('onSubscribe', (message: any) => {
      console.log('onSubscribe', message)
      callback(message)
    })
    return () => {
      stompSocket.current.unsubscribe()
    }
  }, [accountId])
}
export default useStompSocket
