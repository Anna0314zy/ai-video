import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { randomUUID } from 'node:crypto'
import { PackageBatchDto, SaveShotListDto, UpdateShotDto } from '../../common/swagger-dto.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { AppException } from '../../common/app-exception.js'

@ApiTags('分镜 Shot')
@Controller('api/scriptShot/v1')
export class ShotController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get('shotListByProjectId')
  @ApiOperation({ summary: '按项目查询分镜列表' })
  @ApiQuery({ name: 'projectId', example: 1, description: '项目 ID' })
  async list(@Query('projectId') projectId: string) {
    const projectIdNumber = Number(projectId)
    const shots = await this.prisma.shot.findMany({
      where: { projectId: projectIdNumber },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        resources: {
          where: { type: 'image', confirmed: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })

    return {
      shotBaseInfoList: shots.map(mapShot),
      projectId: projectIdNumber,
    }
  }

  @Post('saveShotList')
  @ApiOperation({ summary: '保存分镜列表' })
  @ApiBody({ type: SaveShotListDto })
  async save(@Body() body: SaveShotListDto) {
    const projectId = Number(body.projectId)
    const list = Array.isArray(body.shotInfoDtoList) ? body.shotInfoDtoList : []

    await this.prisma.$transaction(async tx => {
      await tx.shot.deleteMany({ where: { projectId } })
      for (const [index, item] of list.entries()) {
        const shot = item as Record<string, any>
        await tx.shot.create({
          data: {
            projectId,
            title: shot.title || shot.shotName || shot.name || `分镜${index + 1}`,
            content: shot.content || shot.shotContent || shot.description || '',
            duration: toOptionalNumber(shot.duration),
            camera: shot.camera || '',
            scene: shot.scene || '',
            characters: shot.characters || '',
            visualPrompt: shot.visualPrompt || shot.imagePrompt || shot.midjourneyPrompt || '',
            previewImage: shot.previewImage || shot.imageUrl || '',
            videoPrompt: shot.videoPrompt || '',
            narration: shot.narration || '',
            soundEffects: shot.soundEffects || '',
            backgroundMusic: shot.backgroundMusic || '',
            soundEffectResourceIds: normalizeResourceIds(shot.soundEffectResourceIds),
            status: shot.status || 'uncompleted',
            imageStatus: shot.imageStatus || 'uncompleted',
            videoStatus: shot.videoStatus || 'uncompleted',
            voiceStatus: shot.voiceStatus || 'uncompleted',
            sortOrder: Number(shot.sortOrder ?? shot.orderNo ?? index),
          },
        })
      }
      await tx.project.update({
        where: { id: projectId },
        data: { shotNum: list.length },
      })
    })

    return this.list(String(projectId))
  }

  @Post('updateShot')
  @ApiOperation({ summary: '更新单个分镜标题和内容' })
  @ApiBody({ type: UpdateShotDto })
  async updateShot(
    @Body() body: UpdateShotDto,
  ) {
    const projectId = Number(body.projectId)
    const shotId = Number(body.shotId)
    await this.prisma.shot.updateMany({
      where: { id: shotId, projectId },
      data: {
        title: body.shotName || `镜头${shotId}`,
        content: body.shotContent || '',
        visualPrompt: body.visualPrompt,
        previewImage: body.previewImage,
        videoPrompt: body.videoPrompt,
        narration: body.narration,
        soundEffects: body.soundEffects,
        backgroundMusic: body.backgroundMusic,
        soundEffectResourceIds: normalizeResourceIds(body.soundEffectResourceIds),
      },
    })
    const shot = await this.prisma.shot.findFirst({
      where: { id: shotId, projectId },
      include: {
        resources: {
          where: { type: 'image', confirmed: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })
    if (!shot) throw new AppException('not-found')
    return {
      ...mapShot(shot),
      projectId,
    }
  }

  @Post('packageBatch')
  @ApiOperation({ summary: '批量打包分镜' })
  @ApiBody({ type: PackageBatchDto })
  async packageBatch(@Body() body: PackageBatchDto) {
    const task = await this.prisma.generationTask.create({
      data: {
        taskId: createTaskId('shot-package-batch'),
        provider: 'internal',
        type: 'shot-package-batch',
        state: 'PENDING',
        request: JSON.stringify({ shotIds: body.shotIds }),
      },
    })
    return mapTask(task)
  }

  @Post('packageSingle/:shotId')
  @ApiOperation({ summary: '单个分镜打包' })
  @ApiParam({ name: 'shotId', example: 1, description: '分镜 ID' })
  async packageSingle(@Param('shotId') shotId: string) {
    const task = await this.prisma.generationTask.create({
      data: {
        taskId: createTaskId('shot-package-single'),
        provider: 'internal',
        type: 'shot-package-single',
        state: 'PENDING',
        request: JSON.stringify({ shotId: Number(shotId) }),
      },
    })
    return mapTask(task)
  }
}

function mapShot(shot: any) {
  const confirmedImage = Array.isArray(shot.resources)
    ? shot.resources.find((resource: any) => {
        const origin = resource.origin || resource.url || ''
        return shot.previewImage && origin === shot.previewImage
      })
    : undefined
  const previewImage = confirmedImage?.origin || confirmedImage?.url || ''
  const imageStatus = confirmedImage ? 'completed' : 'uncompleted'
  return {
    ...shot,
    shotId: shot.id,
    shotName: shot.title,
    shotContent: shot.content,
    duration: shot.duration,
    camera: shot.camera,
    scene: shot.scene,
    characters: shot.characters,
    visualPrompt: shot.visualPrompt,
    imagePrompt: shot.visualPrompt,
    midjourneyPrompt: shot.visualPrompt,
    previewImage,
    imageUrl: previewImage,
    videoPrompt: shot.videoPrompt,
    narration: shot.narration,
    soundEffects: shot.soundEffects,
    backgroundMusic: shot.backgroundMusic,
    soundEffectResourceIds: parseResourceIds(shot.soundEffectResourceIds),
    sort: shot.sortOrder + 1,
    status: shot.status || 'uncompleted',
    imageStatus,
    videoStatus: shot.videoStatus || 'uncompleted',
    voiceStatus: shot.voiceStatus || 'uncompleted',
    created: shot.createdAt?.toISOString?.(),
    modified: shot.updatedAt?.toISOString?.(),
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

function createTaskId(prefix: string) {
  return `${prefix}-${randomUUID()}`
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
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function normalizeResourceIds(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value.map(Number).filter(Number.isFinite))
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return JSON.stringify(parsed.map(Number).filter(Number.isFinite))
    } catch {
      return value
    }
  }
  return ''
}

function parseResourceIds(value: unknown) {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(String(value))
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : []
  } catch {
    return []
  }
}
