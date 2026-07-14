import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sockjs = require('sockjs')

interface SockJsConnection {
  id: string
  write(data: string): void
  close(): void
  on(event: 'data', callback: (message: string) => void): void
  on(event: 'close', callback: () => void): void
}

interface StompFrame {
  command: string
  headers: Record<string, string>
  body: string
}

interface Subscription {
  id: string
  destination: string
  connection: SockJsConnection
}

const subscriptions = new Map<string, Set<Subscription>>()
const connectionSubscriptions = new Map<string, Set<Subscription>>()
let messageId = 0

export function attachStompBroker(httpServer: unknown) {
  const server = sockjs.createServer({
    prefix: '/api/ws',
    log: () => undefined,
  })

  server.on('connection', (connection: SockJsConnection) => {
    connection.on('data', message => {
      for (const frame of parseFrames(message)) {
        handleFrame(connection, frame)
      }
    })

    connection.on('close', () => {
      removeConnection(connection)
    })
  })

  server.installHandlers(httpServer, {
    prefix: '/api/ws',
  })
}

function handleFrame(connection: SockJsConnection, frame: StompFrame) {
  switch (frame.command) {
    case 'CONNECT':
    case 'STOMP':
      connection.write('CONNECTED\nversion:1.1\nheart-beat:0,0\n\n\0')
      return
    case 'SUBSCRIBE':
      subscribe(connection, frame)
      return
    case 'UNSUBSCRIBE':
      unsubscribe(connection, frame.headers.id)
      return
    case 'SEND':
      handleSend(frame)
      return
    case 'DISCONNECT':
      removeConnection(connection)
      connection.close()
      return
    default:
      return
  }
}

function subscribe(connection: SockJsConnection, frame: StompFrame) {
  const destination = frame.headers.destination
  if (!destination) return

  const subscription: Subscription = {
    id: frame.headers.id || `${connection.id}-${Date.now()}`,
    destination,
    connection,
  }

  if (!subscriptions.has(destination)) subscriptions.set(destination, new Set())
  subscriptions.get(destination)?.add(subscription)

  if (!connectionSubscriptions.has(connection.id)) connectionSubscriptions.set(connection.id, new Set())
  connectionSubscriptions.get(connection.id)?.add(subscription)
}

function unsubscribe(connection: SockJsConnection, subscriptionId?: string) {
  const items = connectionSubscriptions.get(connection.id)
  if (!items) return

  for (const item of [...items]) {
    if (subscriptionId && item.id !== subscriptionId) continue
    subscriptions.get(item.destination)?.delete(item)
    items.delete(item)
  }
}

function removeConnection(connection: SockJsConnection) {
  const items = connectionSubscriptions.get(connection.id)
  if (!items) return

  for (const item of items) {
    subscriptions.get(item.destination)?.delete(item)
  }
  connectionSubscriptions.delete(connection.id)
}

function handleSend(frame: StompFrame) {
  if (frame.headers.destination === '/app/ai/stream/session/chat') {
    handleScriptChat(frame.body)
    return
  }

  if (frame.headers.destination === '/app/message') {
    publish('/user/queue/task/ming', safeJsonParse(frame.body))
  }
}

function handleScriptChat(body: string) {
  const payload = safeJsonParse(body) as {
    accountId?: string
    text?: string
    sessionId?: number
  }
  const accountId = payload.accountId
  if (!accountId) return

  const content = buildScriptReply(payload.text || '')
  const replyDestination = `/user/queue/session/chat/reply/${accountId}`
  const completedDestination = `/user/queue/session/chat/reply/completed/${accountId}`

  for (const chunk of splitChunks(content, 16)) {
    publish(replyDestination, chunk)
  }

  publish(completedDestination, {
    isSuccess: true,
    id: Date.now(),
    sessionChatId: Date.now(),
    sessionId: payload.sessionId,
    role: 'assistant',
    messageContent: content,
    created: Date.now(),
  })
}

function publish(destination: string, payload: unknown) {
  const items = subscriptions.get(destination)
  if (!items?.size) return

  const body = JSON.stringify({ payload })
  for (const item of items) {
    item.connection.write(
      [
        'MESSAGE',
        `destination:${destination}`,
        `message-id:msg-${++messageId}`,
        `subscription:${item.id}`,
        'content-type:application/json',
        '',
        body,
      ].join('\n') + '\0',
    )
  }
}

function parseFrames(message: string): StompFrame[] {
  return message
    .split('\0')
    .map(frame => frame.trim())
    .filter(Boolean)
    .map(parseFrame)
}

function parseFrame(rawFrame: string): StompFrame {
  const [head = '', ...bodyParts] = rawFrame.split('\n\n')
  const [command = '', ...headerLines] = head.split('\n').filter(Boolean)
  const headers = Object.fromEntries(
    headerLines.map(line => {
      const index = line.indexOf(':')
      return index >= 0 ? [line.slice(0, index), line.slice(index + 1)] : [line, '']
    }),
  )

  return {
    command,
    headers,
    body: bodyParts.join('\n\n'),
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function buildScriptReply(prompt: string) {
  return prompt ? `已收到你的剧本需求：${prompt}` : '已收到你的剧本需求。'
}

function splitChunks(value: string, size: number) {
  const chunks: string[] = []
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size))
  }
  return chunks.length ? chunks : ['']
}
