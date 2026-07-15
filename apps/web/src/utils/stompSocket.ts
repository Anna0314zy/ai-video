import { EventEmitter } from 'events'
import Stomp, { Client, Message } from 'stompjs'
// import SockJS from 'sockjs-client'
import { getToken } from './auth'
interface SocketParam {
  baseUrl: string
  subscribeThorough: string[] // 支持多个订阅路径
  sendThorough: string // 发送路径
  onConnect?: () => void
  onDisconnect?: () => void
  onReconnect?: () => void
  onError?: (error: unknown) => void
}

const RECONNECT_INTERVAL = 5000 // 5秒重连间隔
const MAX_RECONNECT_ATTEMPTS = 3 // 最大重连次数

class StompSocket extends EventEmitter {
  private initParam: SocketParam
  private stompClient!: Client
  private subscriptions: Map<string, any> // 使用 Map 来维护多个订阅
  private desiredSubscriptions = new Set<string>()
  private reconnectAttempts = 0
  private manuallyClosed = false

  constructor(socketParam: SocketParam) {
    super()
    this.initParam = socketParam
    this.subscriptions = new Map()
    this.initParam.subscribeThorough.forEach(path => this.desiredSubscriptions.add(path))
    this.connect()
  }

  /**
   * @description: 链接socket
   */
  private connect() {
    if (this.manuallyClosed) return
    const ws = new window.SockJS(this.initParam.baseUrl)
    this.stompClient = Stomp.over(ws)

    this.stompClient.connect(
      {
        Authorization: getToken(),
      },
      () => {
        this.reconnectAttempts = 0
        this.subscriptions.clear()
        this.initParam.onConnect?.()
        console.log('WebSocket connection success')

        // 订阅多个管道
        this.desiredSubscriptions.forEach(path => this.subscribeConnectedPath(path))

        // 监听断开连接事件
        this.stompClient.ws.onclose = () => {
          this.initParam.onDisconnect?.()
          console.warn('WebSocket connection closed. Attempting to reconnect...')
          this.attemptReconnect() // 断开后尝试重连
        }
      },
      err => {
        this.initParam.onError?.(err)
        console.error('WebSocket connection error', err)
        setTimeout(() => {
          console.log('Attempting to reconnect...')
          this.connect() // 重连
        }, RECONNECT_INTERVAL)
      },
    )
  }

  // 发送消息到指定的管道
  public send(path: string, params: string) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(path, {}, params)
      console.log(`Message sent to ${path}`)
      return true
    } else {
      console.warn('无法发送消息：WebSocket 未连接')
      // this.attemptReconnect(); // 如果需要重连
      return false
    }
  }

  // 添加订阅到新的管道
  public subscribe(path: string) {
    this.desiredSubscriptions.add(path)
    if (this.stompClient && this.stompClient.connected) {
      this.subscribeConnectedPath(path)
    } else {
      console.warn('无法订阅：WebSocket 未连接')
    }
  }

  // 取消订阅
  public unsubscribe(path: string) {
    this.desiredSubscriptions.delete(path)
    if (this.subscriptions.has(path)) {
      this.subscriptions.get(path).unsubscribe()
      this.subscriptions.delete(path)
      console.log(`Unsubscribed from ${path}`)
    }
  }

  private subscribeConnectedPath(path: string) {
    if (this.subscriptions.has(path)) {
      console.warn(`Already subscribed to ${path}`)
      return
    }
    const subscription = this.stompClient.subscribe(path, (message: Message) => {
      console.log(`Message received on ${path}`, message.body)
      this.emit(path, JSON.parse(message.body))
    })
    this.subscriptions.set(path, subscription)
    console.log(`Subscribed to ${path}`)
  }

  // 尝试重连
  public attemptReconnect() {
    if (this.manuallyClosed) return
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts += 1
      this.initParam.onReconnect?.()
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
      setTimeout(() => {
        this.connect() // 尝试重连
      }, RECONNECT_INTERVAL)
    } else {
      console.error('Max reconnect attempts reached. Giving up.')
    }
  }

  public disconnect() {
    this.manuallyClosed = true
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {
        this.initParam.onDisconnect?.()
      })
    } else {
      this.initParam.onDisconnect?.()
    }
  }
}

export default StompSocket
