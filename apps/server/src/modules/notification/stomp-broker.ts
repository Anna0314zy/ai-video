import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import type { LlmService } from '../../llm/llm.service.js'
import type { LlmMessage } from '../../llm/llm-provider.js'
import type { PrismaService } from '../../prisma/prisma.service.js'
import { withScriptMarkdownSystemPrompt } from '../script/script-markdown.js'

const require = createRequire(import.meta.url)
const sockjs = require('sockjs')
let llmService: LlmService | undefined
let prismaService: PrismaService | undefined

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

export function attachStompBroker(httpServer: unknown, llm: LlmService, prisma: PrismaService) {
  llmService = llm
  prismaService = prisma
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
    id: frame.headers.id || `${connection.id}-${randomUUID()}`,
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
  if (
    frame.headers.destination === '/app/ai/stream/session/chat' ||
    frame.headers.destination === '/app/ai/stream/session/resend' ||
    frame.headers.destination === '/app/ai/stream/session/continueOutput'
  ) {
    void handleScriptChat(frame.body, frame.headers.destination).catch(error => {
      const payload = safeJsonParse(frame.body) as { accountId?: string; sessionId?: number; requestId?: string }
      if (payload.accountId) {
        publish(`/user/queue/session/chat/reply/completed/${payload.accountId}`, {
          type: 'script.failed',
          isSuccess: false,
          sessionId: payload.sessionId,
          requestId: payload.requestId,
          message: error instanceof Error ? error.message : '生成失败',
        })
      }
    })
    return
  }

  if (frame.headers.destination === '/app/message') {
    publish('/user/queue/task/ming', safeJsonParse(frame.body))
  }
}

async function handleScriptChat(body: string, destination: string) {
  const payload = safeJsonParse(body) as {
    accountId?: string
    text?: string
    sessionId?: number
    requestId?: string
    sessionChatId?: number | string
  }
  const accountId = payload.accountId
  const sessionId = Number(payload.sessionId)
  const requestId = payload.requestId || randomUUID()
  if (!accountId || !Number.isFinite(sessionId) || !llmService || !prismaService) return

  const generation = await buildScriptGeneration(payload, destination, sessionId)
  if (!generation) return

  if (generation.userMessageContent) {
    await prismaService.sessionMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: generation.userMessageContent,
      },
    })
  }

  const replyDestination = `/user/queue/session/chat/reply/${accountId}`
  const completedDestination = `/user/queue/session/chat/reply/completed/${accountId}`
  let content = ''

  for await (const chunk of llmService.streamScript(withScriptMarkdownSystemPrompt(generation.messages))) {
    if (chunk.content) {
      content += chunk.content
      publish(replyDestination, {
        type: 'script.chunk',
        sessionId,
        requestId,
        content: chunk.content,
      })
    }
  }

  const assistantMessage = await prismaService.sessionMessage.create({
    data: {
      sessionId,
      role: 'assistant',
      content,
    },
  })

  publish(completedDestination, {
    type: 'script.completed',
    isSuccess: true,
    requestId,
    id: assistantMessage.id,
    sessionChatId: assistantMessage.id,
    sessionId,
    role: 'assistant',
    messageContent: content,
    created: assistantMessage.createdAt.getTime(),
  })
}

async function buildScriptGeneration(
  payload: { text?: string; sessionChatId?: number | string },
  destination: string,
  sessionId: number,
): Promise<{ messages: LlmMessage[]; userMessageContent?: string } | null> {
  const text = payload.text?.trim()
  if (destination === '/app/ai/stream/session/chat') {
    if (!text) return null
    return {
      messages: [{ role: 'user', content: text }],
      userMessageContent: text,
    }
  }

  if (destination === '/app/ai/stream/session/resend') {
    return buildReplayGeneration(sessionId, payload.sessionChatId, 'resend')
  }

  if (destination === '/app/ai/stream/session/continueOutput') {
    return buildReplayGeneration(sessionId, payload.sessionChatId, 'continue')
  }

  return null
}

async function buildReplayGeneration(
  sessionId: number,
  sessionChatId: number | string | undefined,
  mode: 'resend' | 'continue',
): Promise<{ messages: LlmMessage[] }> {
  if (!prismaService) throw new Error('消息服务未就绪')

  const targetId = Number(sessionChatId)
  if (!Number.isFinite(targetId) || targetId <= 0) throw new Error('缺少需要处理的消息')

  const target = await prismaService.sessionMessage.findFirst({
    where: {
      id: targetId,
      sessionId,
    },
  })
  if (!target) throw new Error('未找到需要处理的消息')

  const contextWhere =
    mode === 'continue'
      ? {
          sessionId,
          OR: [
            { createdAt: { lt: target.createdAt } },
            {
              createdAt: target.createdAt,
              id: { lte: target.id },
            },
          ],
        }
      : {
          sessionId,
          OR: [
            { createdAt: { lt: target.createdAt } },
            {
              createdAt: target.createdAt,
              id: { lt: target.id },
            },
          ],
        }

  const context = await prismaService.sessionMessage.findMany({
    where: contextWhere,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 20,
  })

  const messages = context.reverse().map(message => ({
    role: normalizeMessageRole(message.role),
    content: message.content,
  }))

  messages.push({
    role: 'user',
    content:
      mode === 'continue'
        ? '请从上一条助手回复的结尾继续输出，保持原有风格和结构。只输出续写内容，不要解释，不要提到无法看到上下文。'
        : '请基于以上对话上下文，重新生成上一条助手回复。只输出新的剧本内容，不要解释，不要提到无法看到上下文，不要输出“重新生成”说明。',
  })

  return { messages }
}

function normalizeMessageRole(role: string): LlmMessage['role'] {
  if (role === 'assistant' || role === 'system' || role === 'user') return role
  if (role === 'gpt') return 'assistant'
  return 'user'
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
