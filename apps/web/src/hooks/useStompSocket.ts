import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useSocket } from './useSocket'

type StompSubscription = {
  path: string
  callback: (message: any) => void
}

const useStompSocket = (subscribeThorough: StompSubscription[]) => {
  const callbacksRef = useRef(new Map<string, StompSubscription['callback']>())
  const { accountId } = useSelector((state: RootState) => state.auth.userInfo)
  const { send, subscribe, connected, reconnecting, error } = useSocket()
  const subscriptionPathKey = useMemo(() => subscribeThorough.map(item => item.path).join('|'), [subscribeThorough])

  useEffect(() => {
    callbacksRef.current.clear()
    subscribeThorough.forEach(item => {
      callbacksRef.current.set(`${item.path}/${accountId}`, item.callback)
    })
  }, [accountId, subscribeThorough])

  useEffect(() => {
    if (!accountId) return

    const unsubscribeList = subscribeThorough.map(item => {
      const path = `${item.path}/${accountId}`
      return subscribe(path, message => {
        callbacksRef.current.get(path)?.(message)
      })
    })

    return () => {
      unsubscribeList.forEach(unsubscribe => unsubscribe())
    }
  }, [accountId, subscribe, subscriptionPathKey])

  const stableSend = useCallback(
    (path: string, params: string | object) => {
      return send(path, params)
    },
    [send],
  )

  return {
    send: stableSend,
    connected,
    reconnecting,
    error,
  }
}

export default useStompSocket
