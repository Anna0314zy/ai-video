import type { GenerationProvider, GenerationTask, GenerationTaskRequest } from './generation-provider.js'
import { randomUUID } from 'node:crypto'

export class TencentTextToVideoProvider implements GenerationProvider {
  readonly name = 'tencent'
  readonly kind = 'text-to-video' as const

  async createTask(request: GenerationTaskRequest): Promise<GenerationTask> {
    return {
      taskId: `tencent-text-video-${randomUUID()}`,
      provider: this.name,
      kind: this.kind,
      state: 'PENDING' as const,
      metadata: request.metadata,
    }
  }
}
