import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import StompSocket from '@/utils/stompSocket'
import { RootState } from '@/store'

type SocketMessageHandler = (message: any) => void

interface SocketContextValue {
  connected: boolean
  reconnecting: boolean
  error: unknown
  send: (path: string, params: string | object) => boolean
  subscribe: (path: string, handler: SocketMessageHandler) => () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socketRef = useRef<StompSocket | null>(null)
  const subscriptionsRef = useRef(new Map<string, Set<SocketMessageHandler>>())
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const accountId = useSelector((state: RootState) => state.auth.userInfo.accountId)

  useEffect(() => {
    if (!accountId) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      setReconnecting(false)
      return
    }

    const socket = new StompSocket({
      baseUrl: import.meta.env.VITE_SOCKET_BASE,
      sendThorough: '',
      subscribeThorough: [],
      onConnect: () => {
        setConnected(true)
        setReconnecting(false)
        setError(null)
      },
      onDisconnect: () => {
        setConnected(false)
      },
      onReconnect: () => {
        setConnected(false)
        setReconnecting(true)
      },
      onError: socketError => {
        setConnected(false)
        setError(socketError)
      },
    })

    subscriptionsRef.current.forEach((handlers, path) => {
      handlers.forEach(handler => socket.on(path, handler))
      socket.subscribe(path)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [accountId])

  const send = useCallback((path: string, params: string | object) => {
    const payload = typeof params === 'string' ? params : JSON.stringify(params)
    return socketRef.current?.send(path, payload) ?? false
  }, [])

  const subscribe = useCallback((path: string, handler: SocketMessageHandler) => {
    const currentHandlers = subscriptionsRef.current.get(path) || new Set<SocketMessageHandler>()
    const wasEmpty = currentHandlers.size === 0
    currentHandlers.add(handler)
    subscriptionsRef.current.set(path, currentHandlers)

    socketRef.current?.on(path, handler)
    if (wasEmpty) socketRef.current?.subscribe(path)

    return () => {
      const handlers = subscriptionsRef.current.get(path)
      if (!handlers) return

      handlers.delete(handler)
      socketRef.current?.off(path, handler)

      if (handlers.size === 0) {
        subscriptionsRef.current.delete(path)
        socketRef.current?.unsubscribe(path)
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      connected,
      reconnecting,
      error,
      send,
      subscribe,
    }),
    [connected, error, reconnecting, send, subscribe],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}
