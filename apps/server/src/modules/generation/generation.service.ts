import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { AppException } from '../../common/app-exception.js'
import { ConfigService } from '../../config/config.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { GenerationKind } from './generation-provider.js'

@Injectable()
export class GenerationService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  addTextToImageTask(params: any) {
    const provider = this.configService.value.generation.textToImageProvider
    if (!provider) {
      throw new AppException('feature-not-configured', '文生图 provider 尚未配置')
    }
    return this.createTask(provider, 'text-to-image', params)
  }

  addImageToVideoTask(params: any) {
    const provider = this.configService.value.generation.imageToVideoProvider
    if (!provider) {
      throw new AppException('feature-not-configured', '图生视频 provider 尚未配置')
    }
    return this.createTask(provider, 'image-to-video', params)
  }

  async addTextToVideoTask(params: any) {
    const provider = this.configService.value.generation.textToVideoProvider
    if (!provider) {
      throw new AppException('feature-not-configured', '文生视频 provider 尚未配置')
    }
    return this.createTask(provider, 'text-to-video', params)
  }

  addAudioTask(params: any) {
    return this.createTask('internal', 'tts', params)
  }

  async reinstateTask(taskId: string) {
    const task = await this.prisma.generationTask.findUnique({ where: { taskId } })
    if (!task) throw new AppException('not-found')

    const updated = await this.prisma.generationTask.update({
      where: { taskId },
      data: { state: 'PENDING' },
    })
    return mapTask(updated)
  }

  async createTask(provider: string, type: GenerationKind | 'tts' | 'prompt', request: any) {
    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `${type}-${randomUUID()}`,
        provider,
        type,
        state: 'PENDING',
        request: JSON.stringify(request || {}),
      },
    })
    return mapTask(task)
  }
}

function mapTask(task: any) {
  return {
    id: task.id,
    taskId: task.taskId,
    provider: task.provider,
    type: task.type,
    state: task.state,
    request: parseJson(task.request),
    result: parseJson(task.result),
    created: task.createdAt?.toISOString?.(),
    modified: task.updatedAt?.toISOString?.(),
  }
}

function parseJson(value?: string | null) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
