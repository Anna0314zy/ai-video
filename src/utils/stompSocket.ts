// import SockJS from 'sockjs-client'
import Stomp, { Client, Frame } from 'stompjs'
import { getToken } from '@/utils/auth'

import { EventEmitter } from 'events'
interface SocketParam {
  baseUrl: string // socket 地址
  sendThorough: string // 发送通道
  subscribeThorough: string // 订阅地址
}
class StompSocket extends EventEmitter {
  public subscription: any
  constructor(socketParam: SocketParam) {
    super()
    this.initParam = socketParam
    this.connect()
  }

  private initParam: SocketParam
  private stompClient!: Client

  /**
   * @description: 链接socket
   * @return {*}
   */
  private connect() {
    const ws = new window.SockJS(this.initParam.baseUrl)

    this.stompClient = Stomp.over(ws)
    this.stompClient.connect(
      {
        Authorization: getToken(),
      },
      () => {
        console.log('connect--')
        this.subscription = this.stompClient.subscribe(this.initParam.subscribeThorough, (message: any) => {
          console.log('onSubscribe', message.body)
          this.emit('onSubscribe', JSON.parse(message.body))
        })
      },
      err => {
        console.log('connect-error', err)
      },
    )
  }

  public send() {
    console.log('发送的消息')
    this.stompClient.send(this.initParam.sendThorough, {}, 'hhh')
  }
  // 清除订阅
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
  }
}

export default StompSocket
