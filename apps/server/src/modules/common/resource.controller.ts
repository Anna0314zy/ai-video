import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ResourceImportDto, ResourcePageQueryDto } from '../../common/swagger-dto.js'

@ApiTags('资源 Resource')
@Controller('api/resource/v1')
export class ResourceController {
  @Get('page')
  @ApiOperation({ summary: '资源分页' })
  @ApiQuery({ name: 'pageIndex', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  @ApiQuery({ name: 'type', required: false, example: 'image' })
  page(@Query() query: ResourcePageQueryDto) {
    return {
      current: Number(query.pageIndex || 1),
      size: Number(query.pageSize || 10),
      total: 0,
      records: [],
    }
  }

  @Get('delete')
  @ApiOperation({ summary: '删除资源' })
  @ApiQuery({ name: 'resourceId', required: false, example: 1 })
  delete(@Query() query: any) {
    return query
  }

  @Get('add')
  @ApiOperation({ summary: '添加资源' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  @ApiQuery({ name: 'url', required: false, example: 'image/demo.png' })
  add(@Query() query: any) {
    return query
  }

  @Post('confirm')
  @ApiOperation({ summary: '确认资源' })
  @ApiBody({ type: ResourceImportDto })
  confirm(@Body() body: ResourceImportDto) {
    return body
  }

  @Get('final/video/detail')
  @ApiOperation({ summary: '终选视频详情' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  videoDetail(@Query() query: ResourcePageQueryDto) {
    return query
  }

  @Get('final/voice/detail')
  @ApiOperation({ summary: '终选音频详情' })
  @ApiQuery({ name: 'shotId', required: false, example: 1 })
  voiceDetail(@Query() query: ResourcePageQueryDto) {
    return query
  }

  @Post('import/voice/detail')
  @ApiOperation({ summary: '导入资源文件' })
  @ApiBody({ type: ResourceImportDto })
  importVoice(@Body() body: ResourceImportDto) {
    return body
  }

  @Get('mj/image/history')
  @ApiOperation({ summary: '图片生成历史' })
  imageHistory(@Query() query: ResourcePageQueryDto) {
    return this.emptyPage(query)
  }

  @Get('svd/video/history')
  @ApiOperation({ summary: '视频生成历史' })
  videoHistory(@Query() query: ResourcePageQueryDto) {
    return this.emptyPage(query)
  }

  @Get('tts/voice/history')
  @ApiOperation({ summary: '音频生成历史' })
  audioHistory(@Query() query: ResourcePageQueryDto) {
    return this.emptyPage(query)
  }

  private emptyPage(query: any) {
    return {
      current: Number(query.pageIndex || 1),
      size: Number(query.pageSize || 10),
      total: 0,
      records: [],
    }
  }
}
