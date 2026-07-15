import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { randomUUID } from 'node:crypto'
import { PackageBatchDto, SaveShotListDto } from '../../common/swagger-dto.js'
import { PrismaService } from '../../prisma/prisma.service.js'

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
  return {
    ...shot,
    shotId: shot.id,
    shotName: shot.title,
    shotContent: shot.content,
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
