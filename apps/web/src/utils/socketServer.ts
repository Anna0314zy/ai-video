import { EventEmitter } from "events";

function myLog(...args: unknown[]) {
  console.log("webscoket ", ...args);
}

enum ConnectStatus {
  UnConnected, // 未连接
  Connecting, // 连接中
  Connected, // 已连接
  DisConnected, // 已链接 连接断开 或连接失败
}

interface WebSocketParam {
  url: string;
}
class SocketServer extends EventEmitter {
  private _socket!: WebSocket | null;
  private status: ConnectStatus = ConnectStatus.UnConnected;
  private socketUrl: string = "";

  constructor() {
    super();
    this.status = ConnectStatus.UnConnected;
  }

  /**
   * @description: 初始化websoc
   * @return {*}
   */
  public initServer(webSocketParam: WebSocketParam) {
    const { url } = webSocketParam;
    this.socketUrl = url;
    this.connect();
  }

  /**
   * 开始Socket连接
   */
  connect(): void {
    this._socket = new WebSocket(this.socketUrl);
    this.status = ConnectStatus.Connecting;
    this.addEvents();
  }

  /**
   * 添加事件监听
   */
  addEvents(): void {
    //readyState属性返回实例对象的当前状态，共有四种。  this._socket.readyState
    //CONNECTING：值为0，表示正在连接。
    //OPEN：值为1，表示连接成功，可以通信了。
    //CLOSING：值为2，表示连接正在关闭。
    //CLOSED：值为3，表示连接已经关闭，或者打开连接失败

    this._socket!.onopen = this.onSocketOpen.bind(this);
    this._socket!.onmessage = this.onReceiveMessage.bind(this);
    this._socket!.onclose = this.onSocketClose.bind(this);
    this._socket!.onerror = this.onSocketError.bind(this);
  }

  /**
   * 发送消息到服务器
   * @param msg unknown
   */
  send(data: unknown): void {
    if (this.status !== ConnectStatus.Connected) {
      return myLog("socket is not connected");
    }
    myLog("发送消息socket", data);
    this._socket!.send(JSON.stringify(data));
  }

  /**
   * @description: soket 打开
   * @param {unknown} e
   * @return {*}
   */
  onSocketOpen(e: unknown): void {
    // this.startHeart()
    this.status = ConnectStatus.Connected;
    myLog("[ws]SocketOpen", e);
    this.emit("onOpen");
  }

  /**
   * @description: 收到消息
   * @return {*}
   */
  onReceiveMessage(e: { data: string }): void {
    myLog("[ws]收到消息socket", e);
    try {
      this.emit("onMessage", JSON.parse(e.data));
    } catch (error) {
      console.log('socket 数据异常', error)
    }
  }

  /**
   * @description: socket 关闭
   * @param {*} e
   * @return {*}
   */
  onSocketClose(e: unknown): void {
    this.status = ConnectStatus.DisConnected;
    myLog("[ws]onClose", e);
    this.emit("onClose", e);
  }

  /**
   * @description: socket 出现异常
   * @param {*} e
   * @return {*}
   */
  onSocketError(e: unknown): void {
    this.status = ConnectStatus.DisConnected;
    myLog("[ws]onError", e);
    this.emit("onError", e);
  }
}

export default SocketServer
