import { DeepSeekProvider } from './deepseek-provider.js'
import type { LlmProvider, LlmProviderConfig } from './llm-provider.js'

export function createLlmProvider(config: LlmProviderConfig): LlmProvider {
  if (config.provider === 'deepseek') {
    return new DeepSeekProvider(config)
  }

  throw new Error(`Unsupported LLM provider: ${config.provider}`)
}
