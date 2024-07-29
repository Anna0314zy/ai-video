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
        this.stompClient.subscribe(this.initParam.subscribeThorough, (message: any) => {
          console.log('onSubscribe', message)
          this.emit('onSubscribe', message)
        })
      },
      (err) => {
        console.log('connect-error', err)
      }
    )
  }

  public send() {
    console.log('发送的消息')
    this.stompClient.send(this.initParam.sendThorough, {}, 'hhh')
  }
}

export default StompSocket
