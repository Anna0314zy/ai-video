import { Inject, Injectable, Optional } from '@nestjs/common'
import { createHmac, randomUUID } from 'node:crypto'
import { AppException } from '../../common/app-exception.js'
import { ConfigService } from '../../config/config.service.js'
import { LlmService } from '../../llm/llm.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import type { GenerationKind } from './generation-provider.js'

@Injectable()
export class GenerationService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Optional() @Inject(LlmService) private readonly llmService?: Pick<LlmService, 'completeChat'>,
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
    if (!String(taskId || '').trim()) throw new AppException('validation', 'taskId 不能为空')
    const task = await this.prisma.generationTask.findUnique({ where: { taskId } })
    if (!task) throw new AppException('not-found')
    if (task.provider === 'kuaipao' && (task.type === 'text-to-video' || task.type === 'image-to-video') && task.state === 'RUNNING') {
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

  async translatePromptToEnglish(text: string, kind: 'image' | 'video' = 'image') {
    const source = String(text || '').trim()
    if (!source) return ''
    if (!this.llmService) return source

    try {
      const translated = await this.llmService.completeChat(
        [
          {
            role: 'system',
            content:
              kind === 'video'
                ? 'You are a video-generation prompt engineer. Rewrite the user prompt into natural, concise English for a video model. Preserve subject, scene, action, camera movement, mood, and style. Return English only, with no explanation.'
                : 'You are an image-generation prompt engineer. Rewrite the user prompt into natural, concise English for an image model. Preserve subject, scene, composition, mood, lighting, and style. Return English only, with no explanation.',
          },
          { role: 'user', content: source },
        ],
        { temperature: 0.2 },
      )
      return cleanTranslatedPrompt(translated) || source
    } catch {
      return source
    }
  }

  private async createKuaipaoImageTask(provider: string, params: any) {
    const traceId = `t2i-${Date.now()}-${randomUUID().slice(0, 8)}`
    const startedAt = Date.now()
    logImageStep(traceId, 'start', {
      provider,
      shotId: params?.shotId,
      projectId: params?.projectId,
      hasText: Boolean(params?.text || params?.prompt),
      aspectRatio: params?.imageConfig?.aspectRatio,
    })
    const apiKey = this.configService.value.generation.textToImageApiKey
    if (!apiKey) throw new AppException('feature-not-configured', '快跑图片 API Key 尚未配置')

    const shot = await this.findShot(params?.shotId)
    logImageStep(traceId, 'shot-loaded', {
      shotId: shot?.id || params?.shotId,
      hasShot: Boolean(shot),
      contentLength: shot?.content?.length || 0,
      visualPromptLength: shot?.visualPrompt?.length || 0,
    })
    const sourcePrompt = buildImagePrompt(params, shot)
    if (!sourcePrompt) throw new AppException('validation', '图片 prompt 不能为空')
    logImageStep(traceId, 'prompt-built', {
      sourcePromptLength: sourcePrompt.length,
      sourcePromptPreview: sourcePrompt.slice(0, 120),
    })
    const modelPrompt = await this.translatePromptToEnglish(sourcePrompt, 'image')
    logImageStep(traceId, 'prompt-translated', {
      modelPromptLength: modelPrompt.length,
      translated: modelPrompt !== sourcePrompt,
      elapsedMs: Date.now() - startedAt,
      modelPromptPreview: modelPrompt.slice(0, 120),
    })

    const request = {
      model: this.configService.value.generation.textToImageModel,
      prompt: modelPrompt,
      n: toOptionalNumber(params?.n) || 1,
      size: params?.size || imageSizeFromAspectRatio(params?.imageConfig?.aspectRatio) || this.configService.value.generation.textToImageSize,
      quality: params?.quality || this.configService.value.generation.textToImageQuality,
      response_format: params?.responseFormat || params?.response_format || this.configService.value.generation.textToImageResponseFormat,
      watermark: params?.watermark === undefined ? this.configService.value.generation.textToImageWatermark : Boolean(params.watermark),
    }
    logImageStep(traceId, 'upstream-request-ready', {
      model: request.model,
      size: request.size,
      quality: request.quality,
      responseFormat: request.response_format,
      watermark: request.watermark,
    })

    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `text-to-image-${randomUUID()}`,
        provider,
        type: 'text-to-image',
        state: 'RUNNING',
        request: JSON.stringify({
          ...params,
          shotId: shot?.id || toOptionalNumber(params?.shotId),
          prompt: sourcePrompt,
          modelPrompt,
          upstreamRequest: request,
        }),
      },
    })
    logImageStep(traceId, 'task-created', { id: task.id, taskId: task.taskId })

    if (shot?.id) {
      await this.prisma.shot.update({
        where: { id: shot.id },
        data: { imageStatus: 'running' },
      })
    }

    try {
      const upstreamStartedAt = Date.now()
      logImageStep(traceId, 'upstream-create-start', { baseUrl: this.configService.value.generation.textToImageBaseUrl })
      const upstream = await this.callKuaipaoCreateImage(request)
      logImageStep(traceId, 'upstream-create-done', {
        elapsedMs: Date.now() - upstreamStartedAt,
        totalElapsedMs: Date.now() - startedAt,
        responsePreview: summarizeForLog(upstream),
      })
      const imageUrl = extractKuaipaoImageUrl(upstream)
      logImageStep(traceId, 'upstream-image-url-extracted', {
        hasImageUrl: Boolean(imageUrl),
        imageUrlPreview: imageUrl ? maskUrlForLog(imageUrl) : undefined,
      })
      const storedImageKey = imageUrl ? await this.saveImageToQiniu(imageUrl, traceId) : undefined
      logImageStep(traceId, 'qiniu-save-done', {
        storedImageKey,
        totalElapsedMs: Date.now() - startedAt,
      })
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: storedImageKey ? 'SUCCESS' : 'FAILED',
          result: JSON.stringify({
            upstream,
            imageUrl: storedImageKey,
            upstreamImageUrl: imageUrl,
            prompt: sourcePrompt,
            modelPrompt,
            message: storedImageKey ? undefined : '快跑图片接口未返回图片 URL',
          }),
        },
      })
      logImageStep(traceId, 'done', {
        state: storedImageKey ? 'SUCCESS' : 'FAILED',
        totalElapsedMs: Date.now() - startedAt,
      })
      return mapTask(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logImageStep(traceId, 'failed', {
        message,
        totalElapsedMs: Date.now() - startedAt,
      })
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
    const traceId = `${type}-${Date.now()}-${randomUUID().slice(0, 8)}`
    const startedAt = Date.now()
    logVideoStep(traceId, 'start', {
      provider,
      type,
      shotId: params?.shotId,
      hasImageUrl: Boolean(params?.imageUrl),
      imageUrlPreview: params?.imageUrl ? maskUrlForLog(String(params.imageUrl)) : undefined,
      duration: params?.duration,
      ratio: params?.ratio,
      cameraMovement: params?.cameraMovement,
      motionStrength: params?.motionStrength,
    })
    const apiKey = this.configService.value.generation.textToVideoApiKey
    if (!apiKey) throw new AppException('feature-not-configured', '快跑视频 API Key 尚未配置')

    const shot = await this.findShot(params?.shotId)
    logVideoStep(traceId, 'shot-loaded', {
      hasShot: Boolean(shot),
      shotId: shot?.id || params?.shotId,
      videoPromptLength: shot?.videoPrompt?.length || 0,
      contentLength: shot?.content?.length || 0,
    })
    const sourcePrompt = buildVideoPrompt(params, shot)
    if (!sourcePrompt) throw new AppException('validation', '视频 prompt 不能为空')
    logVideoStep(traceId, 'prompt-built', {
      sourcePromptLength: sourcePrompt.length,
      sourcePromptPreview: sourcePrompt.slice(0, 160),
    })
    const modelPrompt = await this.translatePromptToEnglish(sourcePrompt, 'video')
    logVideoStep(traceId, 'prompt-translated', {
      translated: modelPrompt !== sourcePrompt,
      modelPromptLength: modelPrompt.length,
      modelPromptPreview: modelPrompt.slice(0, 160),
      elapsedMs: Date.now() - startedAt,
    })

    const duration = toOptionalNumber(params?.duration) || shot?.duration || this.configService.value.generation.textToVideoDuration
    const ratio = params?.ratio || this.configService.value.generation.textToVideoRatio
    const apiStyle = this.configService.value.generation.textToVideoApiStyle
    const imageUrl = this.toPublicObjectUrl(params?.imageUrl)
    const request = buildKuaipaoVideoRequest({
      apiStyle,
      model: this.configService.value.generation.textToVideoModel,
      prompt: modelPrompt,
      imageUrl,
      duration,
      ratio,
    })
    logVideoStep(traceId, 'upstream-request-ready', {
      model: request.model,
      contentTypes: getKuaipaoVideoContentTypes(request),
      duration,
      ratio,
      hasImageUrl: Boolean(imageUrl),
      sourceImageUrlPreview: params?.imageUrl ? maskUrlForLog(String(params.imageUrl)) : undefined,
      publicImageUrlPreview: imageUrl ? maskUrlForLog(imageUrl) : undefined,
      apiStyle,
      requestPreview: summarizeForLog(request),
    })

    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `${type}-${randomUUID()}`,
        provider,
        type,
        state: 'RUNNING',
        request: JSON.stringify({
          ...params,
          shotId: shot?.id || toOptionalNumber(params?.shotId),
          prompt: sourcePrompt,
          modelPrompt,
          traceId,
          upstreamRequest: request,
        }),
      },
    })
    logVideoStep(traceId, 'task-created', { id: task.id, taskId: task.taskId })

    if (shot?.id) {
      await this.prisma.shot.update({
        where: { id: shot.id },
        data: { videoStatus: 'running' },
      })
      logVideoStep(traceId, 'shot-status-running', { shotId: shot.id })
    }

    try {
      const upstreamStartedAt = Date.now()
      logVideoStep(traceId, 'upstream-create-start', { baseUrl: this.configService.value.generation.textToVideoBaseUrl })
      const upstream = await this.callKuaipaoCreateVideo(request)
      logVideoStep(traceId, 'upstream-create-done', {
        elapsedMs: Date.now() - upstreamStartedAt,
        totalElapsedMs: Date.now() - startedAt,
        responsePreview: summarizeForLog(upstream),
      })
      const upstreamTaskId = extractKuaipaoTaskId(upstream)
      logVideoStep(traceId, 'upstream-task-id-extracted', {
        hasUpstreamTaskId: Boolean(upstreamTaskId),
        upstreamTaskId,
      })
      if (!upstreamTaskId) {
        const message = `Kuaipao video response missing task id: ${summarizeForLog(upstream)}`
        logVideoStep(traceId, 'failed-no-upstream-task-id', {
          message,
          totalElapsedMs: Date.now() - startedAt,
        })
        const updated = await this.prisma.generationTask.update({
          where: { id: task.id },
          data: {
            state: 'FAILED',
            result: JSON.stringify({
              upstream,
              prompt: sourcePrompt,
              modelPrompt,
              traceId,
              message,
            }),
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
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          result: JSON.stringify({
            upstreamTaskId,
            upstream,
            prompt: sourcePrompt,
            modelPrompt,
            traceId,
          }),
        },
      })
      logVideoStep(traceId, 'done', {
        taskId: task.taskId,
        upstreamTaskId,
        state: updated.state,
        totalElapsedMs: Date.now() - startedAt,
      })
      return mapTask(updated)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logVideoStep(traceId, 'failed', {
        message,
        totalElapsedMs: Date.now() - startedAt,
      })
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
    const request = parseJson(task.request) || {}
    const traceId = result.traceId || request.traceId || `sync-${task.taskId}`
    const startedAt = Date.now()
    logVideoStep(traceId, 'sync-start', {
      taskId: task.taskId,
      taskState: task.state,
      upstreamTaskId: result.upstreamTaskId || extractKuaipaoTaskId(result.upstream),
    })
    const upstreamTaskId = result.upstreamTaskId || extractKuaipaoTaskId(result.upstream)
    if (!upstreamTaskId) {
      const message = 'Kuaipao video task has no upstream task id'
      logVideoStep(traceId, 'sync-failed-no-upstream-task-id', { message })
      const updated = await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: 'FAILED',
          result: JSON.stringify({
            ...result,
            message: result.message || message,
            traceId,
          }),
        },
      })
      if (request.shotId) {
        await this.prisma.shot.update({
          where: { id: Number(request.shotId) },
          data: { videoStatus: 'failed' },
        })
      }
      return mapTask(updated)
    }

    const upstream = await this.callKuaipaoGetVideo(String(upstreamTaskId))
    const state = mapKuaipaoState(upstream)
    const videoUrl = extractKuaipaoVideoUrl(upstream)
    logVideoStep(traceId, 'sync-upstream-done', {
      upstreamTaskId,
      state,
      hasVideoUrl: Boolean(videoUrl),
      videoUrlPreview: videoUrl ? maskUrlForLog(videoUrl) : undefined,
      elapsedMs: Date.now() - startedAt,
      responsePreview: summarizeForLog(upstream),
    })

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
      logVideoStep(traceId, 'sync-resource-created', { resourceId, videoUrlPreview: maskUrlForLog(videoUrl) })
      await this.prisma.shot.update({
        where: { id: Number(request.shotId) },
        data: { videoStatus: 'completed' },
      })
      logVideoStep(traceId, 'sync-shot-status-completed', { shotId: Number(request.shotId) })
    } else if (state === 'FAILED' && request.shotId) {
      await this.prisma.shot.update({
        where: { id: Number(request.shotId) },
        data: { videoStatus: 'failed' },
      })
      logVideoStep(traceId, 'sync-shot-status-failed', { shotId: Number(request.shotId) })
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
          traceId,
        }),
      },
    })
    logVideoStep(traceId, 'sync-done', {
      state,
      resourceId,
      totalElapsedMs: Date.now() - startedAt,
    })
    return mapTask(updated)
  }

  private async findShot(shotId: unknown) {
    const id = toOptionalNumber(shotId)
    if (!id) return null
    return this.prisma.shot.findUnique({ where: { id } })
  }

  private async callKuaipaoCreateVideo(request: any) {
    const path = this.configService.value.generation.textToVideoApiStyle === 'native'
      ? `/api/v3/contents/generations/tasks`
      : `/video/generations`
    
    return this.callKuaipao(path, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  private toPublicObjectUrl(value: unknown) {
    const raw = String(value || '').trim()
    if (!raw) return undefined
    if (/^https?:\/\//.test(raw)) return raw
    const publicDomain = this.configService.value.storage.publicDomain.replace(/\/$/, '')
    return publicDomain ? `${publicDomain}/${raw.replace(/^\//, '')}` : raw
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

  private async saveImageToQiniu(imageUrl: string, traceId: string) {
    const startedAt = Date.now()
    logImageStep(traceId, 'qiniu-download-start', { imageUrlPreview: maskUrlForLog(imageUrl) })
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Download generated image failed: ${response.status} ${await response.text()}`)
    }

    const contentType = normalizeImageContentType(response.headers.get('content-type'))
    const extension = imageExtensionFromContentType(contentType)
    const key = `mj-image/${randomUUID()}.${extension}`
    const arrayBuffer = await response.arrayBuffer()
    logImageStep(traceId, 'qiniu-download-done', {
      contentType,
      bytes: arrayBuffer.byteLength,
      elapsedMs: Date.now() - startedAt,
    })
    const imageBlob = new Blob([arrayBuffer], { type: contentType })
    const uploadToken = createQiniuUploadToken(
      {
        scope: this.configService.value.storage.bucketName,
        deadline: Math.floor(Date.now() / 1000) + this.configService.value.storage.tokenExpiresSeconds,
      },
      this.configService.value.storage.accessKey,
      this.configService.value.storage.secretKey,
    )
    const formData = new FormData()
    formData.append('token', uploadToken)
    formData.append('key', key)
    formData.append('file', imageBlob, key.split('/').pop() || `image.${extension}`)

    const uploadStartedAt = Date.now()
    logImageStep(traceId, 'qiniu-upload-start', {
      key,
      bucket: this.configService.value.storage.bucketName,
      uploadHost: this.configService.value.storage.uploadHost,
    })
    const uploadResponse = await fetch(this.configService.value.storage.uploadHost, {
      method: 'POST',
      body: formData,
    })
    const text = await uploadResponse.text()
    if (!uploadResponse.ok) {
      throw new Error(`Upload generated image to Qiniu failed: ${uploadResponse.status} ${text}`)
    }
    logImageStep(traceId, 'qiniu-upload-done', {
      key,
      elapsedMs: Date.now() - uploadStartedAt,
      totalElapsedMs: Date.now() - startedAt,
      responsePreview: text.slice(0, 300),
    })

    return key
  }

  private async callKuaipaoGetVideo(taskId: string) {
    const path = this.configService.value.generation.textToVideoApiStyle === 'native'
      ? `/api/v3/contents/generations/tasks/${encodeURIComponent(taskId)}`
      : `/video/generations/${encodeURIComponent(taskId)}`
    return this.callKuaipao(path, {
      method: 'GET',
    })
  }

  private async callKuaipao(path: string, init: RequestInit) {
    const baseUrl = this.configService.value.generation.textToVideoBaseUrl.replace(/\/$/, '')
    const url = `${baseUrl}${path}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.configService.value.generation.textToVideoTimeoutMs)
    try {
      console.log('[ImageToVideo][http-request]', {
        method: init.method || 'GET',
        url,
        bodyPreview: typeof init.body === 'string' ? summarizeForLog(init.body) : undefined,
      })
      const response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.configService.value.generation.textToVideoApiKey}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
        signal: controller.signal,
      })
      const text = await response.text()
      console.log('[ImageToVideo][http-response]', {
        method: init.method || 'GET',
        url,
        status: response.status,
        ok: response.ok,
        bodyPreview: summarizeForLog(text),
      })
      const data = parseJson(text) || text
      if (!response.ok) {
        throw new Error(`Kuaipao video request failed: ${response.status} ${typeof data === 'string' ? data : JSON.stringify(data)}`)
      }
      return data
    } catch(error) {
      console.error('[ImageToVideo][http-request-error]', error)
      throw error
    }finally {
      clearTimeout(timeout)
    }
  }
}

function mapTask(task: any) {
  const request = parseJson(task.request)
  const result = parseJson(task.result)
  const resourceType = task.type === 'text-to-image' ? 'image' : task.type === 'tts' ? 'voice' : 'video'
  const prompt = result?.prompt || request?.prompt || request?.text || ''
  const originUrl = result?.videoUrl || result?.imageUrl || result?.audioUrl
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
    text: prompt,
    content: prompt,
    request,
    result,
    originUrl,
    resourceId: result?.resourceId,
    isTrimming: resourceType === 'image' && originUrl ? 1 : undefined,
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

function logImageStep(traceId: string, step: string, payload: Record<string, unknown> = {}) {
  console.info(`[TextToImage][${traceId}] ${step}`, payload)
}

function logVideoStep(traceId: string, step: string, payload: Record<string, unknown> = {}) {
  console.info(`[ImageToVideo][${traceId}] ${step}`, payload)
}

function summarizeForLog(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > 800 ? `${text.slice(0, 800)}...` : text
}

function maskUrlForLog(url: string) {
  try {
    const parsed = new URL(url)
    parsed.search = parsed.search ? '?***' : ''
    return parsed.toString()
  } catch {
    return url.length > 160 ? `${url.slice(0, 160)}...` : url
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

function cleanTranslatedPrompt(value?: string | null) {
  return String(value || '')
    .trim()
    .replace(/^```(?:\w+)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .trim()
}

function createQiniuUploadToken(policy: Record<string, unknown>, accessKey: string, secretKey: string) {
  const encodedPolicy = base64UrlEncode(JSON.stringify(policy))
  const sign = createHmac('sha1', secretKey).update(encodedPolicy).digest()
  return `${accessKey}:${base64UrlEncode(sign)}:${encodedPolicy}`
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
}

function normalizeImageContentType(contentType?: string | null) {
  const type = contentType?.split(';')[0]?.trim().toLowerCase()
  return type && type.startsWith('image/') ? type : 'image/jpeg'
}

function imageExtensionFromContentType(contentType: string) {
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  if (contentType === 'image/gif') return 'gif'
  return 'jpg'
}

function imageSizeFromAspectRatio(aspectRatio?: unknown) {
  const ratio = String(aspectRatio || '').trim()
  if (ratio === '16:9') return '1536x864'
  if (ratio === '9:16') return '864x1536'
  if (ratio === '1:1') return '1024x1024'
  if (ratio === '21:9') return '1792x768'
  return undefined
}

function buildVideoPrompt(params: any, shot: any) {
  const prompt = String(params?.prompt || params?.text || shot?.videoPrompt || shot?.content || '').trim()
  const configPrompt = formatVideoConfigPrompt(params)
  if (prompt && configPrompt && !prompt.includes('视频生成配置')) return `${prompt}\n${configPrompt}`
  return prompt || configPrompt
}

function formatVideoConfigPrompt(params: any) {
  const parts = [
    imageConfigLine('镜头运动', params?.cameraMovement),
    imageConfigLine('运动强度', params?.motionStrength),
  ].filter(Boolean)
  return parts.length ? `视频生成配置：${parts.join('；')}` : ''
}

function buildImagePrompt(params: any, shot: any) {
  const prompt = String(params?.prompt || params?.text || shot?.visualPrompt || shot?.content || '').trim()
  const configPrompt = formatImageConfigPrompt(params?.imageConfig)
  if (prompt && configPrompt && !prompt.includes('图片生成配置')) return `${prompt}\n${configPrompt}`
  return prompt || configPrompt
}

function buildKuaipaoVideoRequest(params: { apiStyle?: string; model: string; prompt: string; imageUrl?: string; duration?: number; ratio?: string }) {
  if (params.apiStyle === 'native') {
    const content: Array<Record<string, unknown>> = []
    if (params.imageUrl) content.push({ type: 'image', url: params.imageUrl })
    content.push({ type: 'text', text: params.prompt })
    return {
      model: params.model,
      content,
      duration: params.duration,
      ratio: params.ratio,
    }
  }

  const metadata: Record<string, unknown> = {}
  if (params.duration) metadata.duration = params.duration
  if (params.ratio) metadata.ratio = params.ratio
  if (params.imageUrl) {
    metadata.content = [
      {
        type: 'image_url',
        image_url: { url: params.imageUrl },
        role: 'reference_image',
      },
    ]
  }

  return {
    model: params.model,
    prompt: params.prompt,
    ...(Object.keys(metadata).length ? { metadata } : {}),
  }
}

function getKuaipaoVideoContentTypes(request: { content?: Array<Record<string, unknown>>; metadata?: Record<string, unknown> }) {
  if (Array.isArray(request.content)) return request.content.map((item: any) => item.type)
  const metadataContent = request.metadata?.content
  return Array.isArray(metadataContent) ? metadataContent.map((item: any) => item.type) : ['text']
}

function formatImageConfigPrompt(config?: Record<string, unknown>) {
  if (!config) return ''
  const parts = [
    imageConfigLine('画面主体', config.subject),
    imageConfigLine('构图/镜头', config.composition),
    imageConfigLine('视觉风格', config.style),
    imageConfigLine('光线/氛围', config.lighting),
    imageConfigLine('画幅比例', config.aspectRatio),
    imageConfigLine('质量要求', config.quality),
    imageConfigLine('色彩倾向', config.colorTone),
    imageConfigLine('人物一致性', config.characterConsistency),
    imageConfigLine('负向提示', config.negativePrompt),
  ].filter(Boolean)
  return parts.length ? `图片生成配置：${parts.join('；')}` : ''
}

function imageConfigLine(label: string, value: unknown) {
  const text = String(value || '').trim()
  return text ? `${label}：${text}` : ''
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
