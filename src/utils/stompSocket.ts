import { EventEmitter } from 'events'
import Stomp, { Client, Message } from 'stompjs'
// import SockJS from 'sockjs-client'
import { getToken } from './auth'
interface SocketParam {
  baseUrl: string
  subscribeThorough: string[] // 支持多个订阅路径
  sendThorough: string // 发送路径
}

const RECONNECT_INTERVAL = 5000 // 5秒重连间隔
const MAX_RECONNECT_ATTEMPTS = 3 // 最大重连次数
let reconnectAttempts = 0

class StompSocket extends EventEmitter {
  private initParam: SocketParam
  private stompClient!: Client
  private subscriptions: Map<string, any> // 使用 Map 来维护多个订阅

  constructor(socketParam: SocketParam) {
    super()
    this.initParam = socketParam
    this.subscriptions = new Map()
    this.connect()
  }

  /**
   * @description: 链接socket
   */
  private connect() {
    const ws = new window.SockJS(this.initParam.baseUrl)
    this.stompClient = Stomp.over(ws)

    this.stompClient.connect(
      {
        Authorization: getToken(),
      },
      () => {
        reconnectAttempts = 0
        console.log('WebSocket connection success')

        // 订阅多个管道
        this.initParam.subscribeThorough.forEach(path => {
          const subscription = this.stompClient.subscribe(path, (message: Message) => {
            console.log(`Message received on ${path}`, message.body)
            this.emit(path, JSON.parse(message.body))
          })
          this.subscriptions.set(path, subscription)
        })

        // 监听断开连接事件
        this.stompClient.ws.onclose = () => {
          console.warn('WebSocket connection closed. Attempting to reconnect...')
          this.attemptReconnect() // 断开后尝试重连
        }
      },
      err => {
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
    } else {
      console.warn('无法发送消息：WebSocket 未连接')
      // this.attemptReconnect(); // 如果需要重连
    }
  }

  // 添加订阅到新的管道
  public subscribe(path: string) {
    if (this.stompClient && this.stompClient.connected) {
      if (!this.subscriptions.has(path)) {
        const subscription = this.stompClient.subscribe(path, (message: Message) => {
          console.log(`Message received on ${path}`, message.body)
          this.emit(path, JSON.parse(message.body))
        })
        this.subscriptions.set(path, subscription)
        console.log(`Subscribed to ${path}`)
      } else {
        console.warn(`Already subscribed to ${path}`)
      }
    } else {
      console.warn('无法订阅：WebSocket 未连接')
    }
  }

  // 取消订阅
  public unsubscribe(path: string) {
    if (this.subscriptions.has(path)) {
      this.subscriptions.get(path).unsubscribe()
      this.subscriptions.delete(path)
      console.log(`Unsubscribed from ${path}`)
    }
  }

  // 尝试重连
  public attemptReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts += 1
      console.log(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
      setTimeout(() => {
        this.connect() // 尝试重连
      }, RECONNECT_INTERVAL)
    } else {
      console.error('Max reconnect attempts reached. Giving up.')
    }
  }
}

export default StompSocket
