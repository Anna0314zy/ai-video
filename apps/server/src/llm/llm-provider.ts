export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmChatRequest {
  messages: LlmMessage[]
  model?: string
  temperature?: number
}

export interface LlmChatChunk {
  content: string
  done: boolean
}

export interface LlmProvider {
  name: string
  defaultModel: string
  streamChat(request: LlmChatRequest): AsyncIterable<LlmChatChunk>
}

export interface LlmProviderConfig {
  provider: string
  baseUrl: string
  apiKey: string
  scriptModel: string
  timeoutMs: number
  retryCount: number
}
