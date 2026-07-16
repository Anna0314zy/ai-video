import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '../config/config.service.js'
import { createLlmProvider } from './llm-provider-factory.js'
import type { LlmMessage } from './llm-provider.js'

@Injectable()
export class LlmService {
  private readonly provider

  constructor(@Inject(ConfigService) configService: ConfigService) {
    this.provider = createLlmProvider(configService.value.llm)
  }

  streamScript(messages: LlmMessage[]) {
    return this.provider.streamChat({ messages })
  }

  async completeChat(messages: LlmMessage[], options?: { temperature?: number; model?: string }) {
    let content = ''
    for await (const chunk of this.provider.streamChat({
      messages,
      temperature: options?.temperature,
      model: options?.model,
    })) {
      if (chunk.content) content += chunk.content
    }
    return content
  }
}
