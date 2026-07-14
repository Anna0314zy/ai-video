import type { GenerationProvider, GenerationTask, GenerationTaskRequest } from './generation-provider.js'

export class TencentTextToVideoProvider implements GenerationProvider {
  readonly name = 'tencent'
  readonly kind = 'text-to-video' as const

  async createTask(request: GenerationTaskRequest): Promise<GenerationTask> {
    return {
      taskId: `tencent-text-video-${Date.now()}`,
      provider: this.name,
      kind: this.kind,
      state: 'PENDING' as const,
      metadata: request.metadata,
    }
  }
}
