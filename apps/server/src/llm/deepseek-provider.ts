import type { LlmChatChunk, LlmChatRequest, LlmProvider, LlmProviderConfig } from './llm-provider.js'

export class DeepSeekProvider implements LlmProvider {
  readonly name = 'deepseek'
  readonly defaultModel: string

  constructor(private readonly config: LlmProviderConfig) {
    this.defaultModel = config.scriptModel
  }

  async *streamChat(request: LlmChatRequest): AsyncIterable<LlmChatChunk> {
    const model = request.model || this.defaultModel
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`DeepSeek request failed: ${response.status} ${errorText}`)
      }

      if (!response.body) {
        throw new Error('DeepSeek stream response body is empty')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const content = parseStreamLine(line)
          if (content === '[DONE]') {
            yield { content: '', done: true }
            return
          }
          if (content) {
            yield { content, done: false }
          }
        }
      }

      yield { content: '', done: true }
    } finally {
      clearTimeout(timeout)
    }
  }
}

function parseStreamLine(line: string) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return ''

  const data = trimmed.slice(5).trim()
  if (!data || data === '[DONE]') return data

  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{
        delta?: {
          content?: string
        }
      }>
    }
    return parsed.choices?.[0]?.delta?.content || ''
  } catch {
    return ''
  }
}
