## socketServer 使用说明

```javascript
import SocketServer from '@utils/socketServer'
const socketServer = new SocketServer()
socketServer.initServer({
    url: 'wss://xxxxx',
    // 后续增加参数
})

// 发送消息
socketServer.send()

// socket 打开时
socketServer.on('onOpen', () => {

})

// socket 接收的消息
socketServer.on('onMessage', () => {

})

// socket 关闭时
socketServer.on('onClose', () => {

})

// socket 失败时
socketServer.on('onError', () => {

})

```