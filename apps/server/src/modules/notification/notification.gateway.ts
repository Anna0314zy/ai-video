import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

@WebSocketGateway({
  path: '/api/ws',
  cors: true,
})
export class NotificationGateway {
  @WebSocketServer()
  server: unknown

  @SubscribeMessage('/app/message')
  message(@MessageBody() body: unknown) {
    return body
  }

  @SubscribeMessage('/app/ai/stream/session/chat')
  scriptChatNotice(@MessageBody() body: unknown) {
    return body
  }
}
