import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ResourceConfirmDto, ResourceImportDto, ResourcePageQueryDto } from '../../common/swagger-dto.js'
import { AppException } from '../../common/app-exception.js'
import { PrismaService } from '../../prisma/prisma.service.js'

@ApiTags('资源 Resource')
@Controller('api/resource/v1')
export class ResourceController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get('page')
  @ApiOperation({ summary: '资源分页' })
  @ApiQuery({ name: 'pageIndex', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  @ApiQuery({ name: 'type', required: false, example: 'image' })
  async page(@Query() query: ResourcePageQueryDto) {
    return this.pageResources(query)
  }

  private async pageResources(query: ResourcePageQueryDto) {
    const current = Number(query.pageIndex || 1)
    const size = Number(query.pageSize || 10)
    const where = {
      ...(query.shotId ? { shotId: Number(query.shotId) } : {}),
      ...(query.type ? { type: query.type } : {}),
    }
    const [total, records] = await this.prisma.$transaction([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (current - 1) * size,
        take: size,
        include: { shot: true },
      }),
    ])

    return {
      current,
      size,
      total,
      records: records.map(mapResource),
    }
  }

  @Get('delete')
  @ApiOperation({ summary: '删除资源' })
  @ApiQuery({ name: 'resourceId', required: false, example: 1 })
  async delete(@Query() query: any) {
    const id = Number(query.resourceId || query.id)
    if (Number.isFinite(id) && id > 0) {
      await this.prisma.resource.deleteMany({ where: { id } })
    }
    return { resourceId: id }
  }

  @Get('add')
  @ApiOperation({ summary: '添加资源' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  @ApiQuery({ name: 'url', required: false, example: 'image/demo.png' })
  async add(@Query() query: any) {
    const historyId = toOptionalNumber(query.historyId)
    if (historyId) {
      const task = await this.prisma.generationTask.findUnique({ where: { id: historyId } })
      const mappedTask = task ? mapTaskHistory(task) : null
      if (!mappedTask?.originUrl) {
        throw new Error('生成历史没有可添加的资源')
      }
      const shotId = toOptionalNumber(query.shotId) || mappedTask.shotId || undefined
      const type = query.type || mappedTask.type || 'image'
      const existing = await this.prisma.resource.findFirst({
        where: { shotId, type, origin: mappedTask.originUrl },
        orderBy: { updatedAt: 'desc' },
      })
      if (existing) return mapResource(existing)

      const resource = await this.prisma.resource.create({
        data: {
          shotId,
          type,
          url: mappedTask.originUrl,
          origin: mappedTask.originUrl,
          confirmed: false,
        },
      })
      return mapResource(resource)
    }

    const shotId = toOptionalNumber(query.shotId)
    const type = query.type || 'image'
    const origin = query.originPath || query.url || ''
    const existing = await this.prisma.resource.findFirst({
      where: { shotId, type, origin },
      orderBy: { updatedAt: 'desc' },
    })
    if (existing) return mapResource(existing)

    const resource = await this.prisma.resource.create({
      data: {
        shotId,
        type,
        url: query.url || query.originPath || '',
        origin,
        confirmed: false,
      },
    })
    return mapResource(resource)
  }

  @Post('confirm')
  @ApiOperation({ summary: '确认资源' })
  @ApiBody({ type: ResourceConfirmDto })
  async confirm(@Body() body: ResourceConfirmDto) {
    const shotId = Number(body.shotId)
    const type = body.type
    const resourceId = toOptionalNumber(body.resourceId)
    if (!resourceId && !body.originPath) {
      throw new AppException('validation', 'resourceId 或 originPath 不能为空')
    }

    const resource = await this.prisma.$transaction(async tx => {
      await tx.resource.updateMany({
        where: { shotId, type },
        data: { confirmed: false },
      })

      const selected = resourceId
        ? await tx.resource
            .update({
              where: { id: resourceId },
              data: { shotId, type, confirmed: true },
            })
            .catch(() => {
              throw new AppException('not-found', '资源不存在')
            })
        : await tx.resource.create({
            data: {
              shotId,
              type,
              url: body.originPath,
              origin: body.originPath,
              confirmed: true,
            },
          })

      await tx.shot.update({
        where: { id: shotId },
        data: buildShotConfirmUpdate(type, selected.origin || selected.url || ''),
      })

      return selected
    })
    return mapResource(resource)
  }

  @Get('final/video/detail')
  @ApiOperation({ summary: '终选视频详情' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  async videoDetail(@Query() query: ResourcePageQueryDto) {
    return this.finalDetail(query, 'video')
  }

  @Get('final/voice/detail')
  @ApiOperation({ summary: '终选音频详情' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  async voiceDetail(@Query() query: ResourcePageQueryDto) {
    return this.finalDetail(query, 'voice')
  }

  @Post('import/voice/detail')
  @ApiOperation({ summary: '导入资源文件' })
  @ApiBody({ type: ResourceImportDto })
  async importVoice(@Body() body: ResourceImportDto) {
    const resource = await this.prisma.resource.create({
      data: {
        shotId: body.shotId,
        type: body.type,
        url: body.originPath,
        origin: body.originPath,
      },
    })
    return mapResource(resource)
  }

  @Get('mj/image/history')
  @ApiOperation({ summary: '图片生成历史' })
  async imageHistory(@Query() query: ResourcePageQueryDto) {
    return this.pageTaskHistory(query, 'text-to-image')
  }

  @Get('svd/video/history')
  @ApiOperation({ summary: '视频生成历史' })
  videoHistory(@Query() query: ResourcePageQueryDto) {
    return this.pageResources({ ...query, type: 'video' })
  }

  @Get('tts/voice/history')
  @ApiOperation({ summary: '音频生成历史' })
  audioHistory(@Query() query: ResourcePageQueryDto) {
    return this.pageResources({ ...query, type: 'voice' })
  }

  private async finalDetail(query: ResourcePageQueryDto, type: string) {
    const resources = await this.prisma.resource.findMany({
      where: {
        type,
        confirmed: true,
        ...(query.shotId ? { shotId: Number(query.shotId) } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: { shot: true },
    })
    const resource = resources.find(isReallyFinalResource)
    return resource ? mapResource(resource) : null
  }

  private async pageTaskHistory(query: ResourcePageQueryDto, taskType: string) {
    const current = Number(query.pageIndex || 1)
    const size = Number(query.pageSize || 10)
    const all = await this.prisma.generationTask.findMany({
      where: { type: taskType },
      orderBy: { updatedAt: 'desc' },
    })
    const shotId = toOptionalNumber(query.shotId)
    const records = all.map(mapTaskHistory).filter(record => !shotId || record.shotId === shotId)
    return {
      current,
      size,
      total: records.length,
      records: records.slice((current - 1) * size, current * size),
    }
  }
}

function mapResource(resource: any) {
  const originUrl = resource.origin || resource.url || ''
  return {
    ...resource,
    resourceId: resource.id,
    historyId: resource.id,
    taskId: `resource-${resource.id}`,
    taskState: 'Completed',
    isFinal: isReallyFinalResource(resource) ? 'final' : '',
    originPath: originUrl,
    originUrl,
    compressUrl: resource.url || originUrl,
    name: originUrl.split('/').pop() || `资源${resource.id}`,
    created: resource.createdAt?.toISOString?.(),
    modified: resource.updatedAt?.toISOString?.(),
  }
}

function isReallyFinalResource(resource: any) {
  if (!resource?.confirmed) return false
  if (!resource.shot) return true
  const originUrl = resource.origin || resource.url || ''
  return Boolean(originUrl && resource.shot.previewImage === originUrl)
}

function mapTaskHistory(task: any) {
  const request = parseJson(task.request) || {}
  const result = parseJson(task.result) || {}
  const resourceType = task.type === 'text-to-image' ? 'image' : task.type === 'tts' ? 'voice' : 'video'
  const originUrl = result.videoUrl || result.imageUrl || result.audioUrl || ''
  const prompt = result.prompt || request.prompt || request.text || ''
  return {
    id: task.id,
    historyId: task.id,
    taskId: task.taskId,
    provider: task.provider,
    taskType: task.type,
    type: resourceType,
    shotId: request.shotId || 0,
    taskState: mapFrontendTaskState(task.state),
    state: task.state,
    text: prompt,
    content: prompt,
    request,
    result,
    originUrl,
    compressUrl: originUrl,
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

function buildShotConfirmUpdate(type: string, originUrl: string) {
  if (type === 'image') {
    return {
      imageStatus: 'completed',
      previewImage: originUrl,
    }
  }
  if (type === 'video') {
    return { videoStatus: 'completed' }
  }
  if (type === 'voice') {
    return { voiceStatus: 'completed' }
  }
  return {}
}

function parseJson(value?: string | null) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
