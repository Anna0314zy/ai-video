import type { LlmChatChunk, LlmChatRequest, LlmProvider, LlmProviderConfig } from './llm-provider.js'

export class DeepSeekProvider implements LlmProvider {
  readonly name = 'deepseek'
  readonly defaultModel: string

  constructor(private readonly config: LlmProviderConfig) {
    this.defaultModel = config.scriptModel
  }

  async *streamChat(request: LlmChatRequest): AsyncIterable<LlmChatChunk> {
    const model = request.model || this.defaultModel
    const lastUserMessage = [...request.messages].reverse().find(message => message.role === 'user')

    yield {
      content: `[${model}] ${lastUserMessage?.content || ''}`,
      done: false,
    }
    yield {
      content: '',
      done: true,
    }
  }
}
