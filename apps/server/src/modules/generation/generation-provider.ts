export type GenerationKind = 'text-to-image' | 'text-to-video' | 'image-to-video'

export interface GenerationTaskRequest {
  kind: GenerationKind
  prompt?: string
  imageUrl?: string
  metadata?: Record<string, unknown>
}

export interface GenerationTask {
  taskId: string
  provider: string
  kind: GenerationKind
  state: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  metadata?: Record<string, unknown>
}

export interface GenerationProvider {
  name: string
  kind: GenerationKind
  createTask(request: GenerationTaskRequest): Promise<GenerationTask>
}
