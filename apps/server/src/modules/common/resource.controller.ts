import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ResourceImportDto, ResourcePageQueryDto } from '../../common/swagger-dto.js'
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
    const resource = await this.prisma.resource.create({
      data: {
        shotId: toOptionalNumber(query.shotId),
        type: query.type || 'image',
        url: query.url || query.originPath || '',
        origin: query.originPath || query.url || '',
      },
    })
    return mapResource(resource)
  }

  @Post('confirm')
  @ApiOperation({ summary: '确认资源' })
  @ApiBody({ type: ResourceImportDto })
  async confirm(@Body() body: ResourceImportDto) {
    const resource = await this.prisma.resource.create({
      data: {
        shotId: body.shotId,
        type: body.type,
        url: body.originPath,
        origin: body.originPath,
        confirmed: true,
      },
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
  imageHistory(@Query() query: ResourcePageQueryDto) {
    return this.pageResources({ ...query, type: 'image' })
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
    const resource = await this.prisma.resource.findFirst({
      where: {
        type,
        confirmed: true,
        ...(query.shotId ? { shotId: Number(query.shotId) } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    })
    return resource ? mapResource(resource) : null
  }
}

function mapResource(resource: any) {
  return {
    ...resource,
    resourceId: resource.id,
    originPath: resource.origin,
    created: resource.createdAt?.toISOString?.(),
    modified: resource.updatedAt?.toISOString?.(),
  }
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
