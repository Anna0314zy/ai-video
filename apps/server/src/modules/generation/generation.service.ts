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
    if (provider === 'kuaipao') {
      return this.createKuaipaoImageTask(provider, params)
    }
    return this.createTask(provider, 'text-to-image', params)
  }

  addImageToVideoTask(params: any) {
    const provider = this.configService.value.generation.imageToVideoProvider || this.configService.value.generation.textToVideoProvider
    if (!provider) {
      throw new AppException('feature-not-configured', '图生视频 provider 尚未配置')
    }
    if (provider === 'kuaipao') {
      return this.createKuaipaoVideoTask(provider, 'image-to-video', params)
    }
    return this.createTask(provider, 'image-to-video', params)
  }

  async addTextToVideoTask(params: any) {
    const provider = this.configService.value.generation.textToVideoProvider
    if (!provider) {
      throw new AppException('feature-not-configured', '文生视频 provider 尚未配置')
    }
    if (provider === 'kuaipao') {
      return this.createKuaipaoVideoTask(provider, 'text-to-video', params)
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

  async getTask(taskId: string) {
    const task = await this.prisma.generationTask.findUnique({ where: { taskId } })
    if (!task) throw new AppException('not-found')
    if (task.provider === 'kuaipao' && (task.type === 'text-to-video' || task.type === 'image-to-video')) {
      return this.syncKuaipaoVideoTask(task)
    }
    return mapTask(task)
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

  private async createKuaipaoImageTask(provider: string, params: any) {
    const apiKey = this.configService.value.generation.textToImageApiKey
    if (!apiKey) throw new AppException('feature-not-configured', '快跑图片 API Key 尚未配置')

    const shot = await this.findShot(params?.shotId)
    const prompt = buildImagePrompt(params, shot)
    if (!prompt) throw new AppException('validation', '图片 prompt 不能为空')

    const request = {
      model: this.configService.value.generation.textToImageModel,
      prompt,
      n: toOptionalNumber(params?.n) || 1,
      size: params?.size || this.configService.value.generation.textToImageSize,
      quality: params?.quality || this.configService.value.generation.textToImageQuality,
      response_format: params?.responseFormat || params?.response_format || this.configService.value.generation.textToImageResponseFormat,
      watermark: params?.watermark === undefined ? this.configService.value.generation.textToImageWatermark : Boolean(params.watermark),
    }

    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `text-to-image-${randomUUID()}`,
        provider,
        type: 'text-to-image',
        state: 'RUNNING',
        request: JSON.stringify({
          ...params,
          shotId: shot?.id || toOptionalNumber(params?.shotId),
          prompt,
          upstreamRequest: request,
        }),
      },
    })

    if (shot?.id) {
      await this.prisma.shot.update({
        where: { id: shot.id },
        data: { imageStatus: 'running' },
      })
    }

    try {
      const upstream = await this.callKuaipaoCreateImage(request)
      const imageUrl = extractKuaipaoImageUrl(upstream)
      let resourceId: number | undefined
      if (imageUrl && shot?.id) {
        const resource = await this.prisma.resource.create({
          data: {
            shotId: shot.id,
            type: 'image',
            url: imageUrl,
            origin: imageUrl,
          },
        })
        resourceId = resource.id
        await this.prisma.shot.update({
          where: { id: shot.id },
          data: { imageStatus: 'completed' },
        })
      }
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: imageUrl ? 'SUCCESS' : 'FAILED',
          result: JSON.stringify({
            upstream,
            imageUrl,
            resourceId,
            message: imageUrl ? undefined : '快跑图片接口未返回图片 URL',
          }),
        },
      })
      return mapTask(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: 'FAILED',
          result: JSON.stringify({ message }),
        },
      })
      if (shot?.id) {
        await this.prisma.shot.update({
          where: { id: shot.id },
          data: { imageStatus: 'failed' },
        })
      }
      return mapTask(updated)
    }
  }

  private async createKuaipaoVideoTask(provider: string, type: 'text-to-video' | 'image-to-video', params: any) {
    const apiKey = this.configService.value.generation.textToVideoApiKey
    if (!apiKey) throw new AppException('feature-not-configured', '快跑视频 API Key 尚未配置')

    const shot = await this.findShot(params?.shotId)
    const prompt = buildVideoPrompt(params, shot)
    if (!prompt) throw new AppException('validation', '视频 prompt 不能为空')

    const request = {
      model: this.configService.value.generation.textToVideoModel,
      content: buildKuaipaoVideoContent(prompt, params?.imageUrl),
      duration: toOptionalNumber(params?.duration) || shot?.duration || this.configService.value.generation.textToVideoDuration,
      ratio: params?.ratio || this.configService.value.generation.textToVideoRatio,
    }

    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `${type}-${randomUUID()}`,
        provider,
        type,
        state: 'RUNNING',
        request: JSON.stringify({
          ...params,
          shotId: shot?.id || toOptionalNumber(params?.shotId),
          prompt,
          upstreamRequest: request,
        }),
      },
    })

    if (shot?.id) {
      await this.prisma.shot.update({
        where: { id: shot.id },
        data: { videoStatus: 'running' },
      })
    }

    try {
      const upstream = await this.callKuaipaoCreateVideo(request)
      const upstreamTaskId = extractKuaipaoTaskId(upstream)
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          result: JSON.stringify({
            upstreamTaskId,
            upstream,
          }),
        },
      })
      return mapTask(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: 'FAILED',
          result: JSON.stringify({ message }),
        },
      })
      if (shot?.id) {
        await this.prisma.shot.update({
          where: { id: shot.id },
          data: { videoStatus: 'failed' },
        })
      }
      return mapTask(updated)
    }
  }

  private async syncKuaipaoVideoTask(task: any) {
    const result = parseJson(task.result) || {}
    const upstreamTaskId = result.upstreamTaskId || extractKuaipaoTaskId(result.upstream)
    if (!upstreamTaskId) return mapTask(task)

    const upstream = await this.callKuaipaoGetVideo(String(upstreamTaskId))
    const state = mapKuaipaoState(upstream)
    const videoUrl = extractKuaipaoVideoUrl(upstream)
    const request = parseJson(task.request) || {}

    let resourceId: number | undefined
    if (state === 'SUCCESS' && videoUrl && request.shotId) {
      const existing = await this.prisma.resource.findFirst({
        where: {
          shotId: Number(request.shotId),
          type: 'video',
          origin: videoUrl,
        },
      })
      const resource =
        existing ||
        (await this.prisma.resource.create({
          data: {
            shotId: Number(request.shotId),
            type: 'video',
            url: videoUrl,
            origin: videoUrl,
          },
        }))
      resourceId = resource.id
      await this.prisma.shot.update({
        where: { id: Number(request.shotId) },
        data: { videoStatus: 'completed' },
      })
    } else if (state === 'FAILED' && request.shotId) {
      await this.prisma.shot.update({
        where: { id: Number(request.shotId) },
        data: { videoStatus: 'failed' },
      })
    }

    const updated = await this.prisma.generationTask.update({
      where: { id: task.id },
      data: {
        state,
        result: JSON.stringify({
          ...result,
          upstreamTaskId,
          upstream,
          videoUrl,
          resourceId,
        }),
      },
    })
    return mapTask(updated)
  }

  private async findShot(shotId: unknown) {
    const id = toOptionalNumber(shotId)
    if (!id) return null
    return this.prisma.shot.findUnique({ where: { id } })
  }

  private async callKuaipaoCreateVideo(request: any) {
    return this.callKuaipao(`/api/v3/contents/generations/tasks`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  private async callKuaipaoCreateImage(request: any) {
    return this.callKuaipaoImage(`/images/generations`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  private async callKuaipaoImage(path: string, init: RequestInit) {
    const baseUrl = this.configService.value.generation.textToImageBaseUrl.replace(/\/$/, '')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.configService.value.generation.textToImageTimeoutMs)
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.configService.value.generation.textToImageApiKey}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
        signal: controller.signal,
      })
      const text = await response.text()
      const data = parseJson(text) || text
      if (!response.ok) {
        throw new Error(`Kuaipao image request failed: ${response.status} ${typeof data === 'string' ? data : JSON.stringify(data)}`)
      }
      return data
    } finally {
      clearTimeout(timeout)
    }
  }

  private async callKuaipaoGetVideo(taskId: string) {
    return this.callKuaipao(`/api/v3/contents/generations/tasks/${encodeURIComponent(taskId)}`, {
      method: 'GET',
    })
  }

  private async callKuaipao(path: string, init: RequestInit) {
    const baseUrl = this.configService.value.generation.textToVideoBaseUrl.replace(/\/$/, '')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.configService.value.generation.textToVideoTimeoutMs)
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.configService.value.generation.textToVideoApiKey}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
        signal: controller.signal,
      })
      const text = await response.text()
      const data = parseJson(text) || text
      if (!response.ok) {
        throw new Error(`Kuaipao video request failed: ${response.status} ${typeof data === 'string' ? data : JSON.stringify(data)}`)
      }
      return data
    } finally {
      clearTimeout(timeout)
    }
  }
}

function mapTask(task: any) {
  const request = parseJson(task.request)
  const result = parseJson(task.result)
  const resourceType = task.type === 'text-to-image' ? 'image' : task.type === 'tts' ? 'voice' : 'video'
  return {
    id: task.id,
    historyId: task.id,
    taskId: task.taskId,
    provider: task.provider,
    taskType: task.type,
    type: resourceType,
    shotId: request?.shotId || 0,
    taskState: mapFrontendTaskState(task.state),
    state: task.state,
    request,
    result,
    originUrl: result?.videoUrl || result?.imageUrl || result?.audioUrl,
    resourceId: result?.resourceId,
    created: task.createdAt?.toISOString?.(),
    modified: task.updatedAt?.toISOString?.(),
  }
}

function mapFrontendTaskState(state: string) {
  if (state === 'SUCCESS') return 'Completed'
  if (state === 'FAILED') return 'Failed'
  if (state === 'RUNNING') return 'Processing'
  return 'Queued'
}

function parseJson(value?: string | null) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function buildVideoPrompt(params: any, shot: any) {
  return String(params?.prompt || params?.text || shot?.videoPrompt || shot?.content || '').trim()
}

function buildImagePrompt(params: any, shot: any) {
  return String(params?.prompt || params?.text || shot?.visualPrompt || shot?.content || '').trim()
}

function buildKuaipaoVideoContent(prompt: string, imageUrl?: string) {
  const content: Array<Record<string, string>> = [{ type: 'text', text: prompt }]
  if (imageUrl) content.push({ type: 'image_url', image_url: imageUrl })
  return content
}

function extractKuaipaoImageUrl(response: any) {
  const candidates = [
    response?.url,
    response?.image_url,
    response?.imageUrl,
    response?.data?.url,
    response?.data?.image_url,
    response?.data?.imageUrl,
    Array.isArray(response?.data) ? response.data[0]?.url : undefined,
    Array.isArray(response?.data) ? response.data[0]?.image_url : undefined,
    Array.isArray(response?.data) ? response.data[0]?.imageUrl : undefined,
    response?.output?.url,
    response?.output?.image_url,
    response?.output?.imageUrl,
  ]
  return candidates.find(value => typeof value === 'string' && value)
}

function extractKuaipaoTaskId(response: any) {
  return (
    response?.id ||
    response?.taskId ||
    response?.task_id ||
    response?.data?.id ||
    response?.data?.taskId ||
    response?.data?.task_id ||
    response?.data?.task?.id
  )
}

function extractKuaipaoVideoUrl(response: any) {
  const candidates = [
    response?.video_url,
    response?.videoUrl,
    response?.url,
    response?.data?.video_url,
    response?.data?.videoUrl,
    response?.data?.url,
    response?.data?.output?.video_url,
    response?.data?.output?.videoUrl,
    response?.data?.output?.url,
    response?.output?.video_url,
    response?.output?.videoUrl,
    response?.output?.url,
  ]
  return candidates.find(value => typeof value === 'string' && value)
}

function mapKuaipaoState(response: any) {
  const raw = String(response?.status || response?.state || response?.data?.status || response?.data?.state || '').toLowerCase()
  if (['succeeded', 'success', 'completed', 'complete', 'done'].includes(raw)) return 'SUCCESS'
  if (['failed', 'error', 'canceled', 'cancelled'].includes(raw)) return 'FAILED'
  return 'RUNNING'
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}
