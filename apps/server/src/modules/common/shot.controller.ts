import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PackageBatchDto, SaveShotListDto } from '../../common/swagger-dto.js'

@ApiTags('分镜 Shot')
@Controller('api/scriptShot/v1')
export class ShotController {
  @Get('shotListByProjectId')
  @ApiOperation({ summary: '按项目查询分镜列表' })
  @ApiQuery({ name: 'projectId', example: 1, description: '项目 ID' })
  list(@Query('projectId') projectId: string) {
    return { shotBaseInfoList: [], projectId }
  }

  @Post('saveShotList')
  @ApiOperation({ summary: '保存分镜列表' })
  @ApiBody({ type: SaveShotListDto })
  save(@Body() body: SaveShotListDto) {
    return body
  }

  @Post('packageBatch')
  @ApiOperation({ summary: '批量打包分镜' })
  @ApiBody({ type: PackageBatchDto })
  packageBatch(@Body('shotIds') shotIds: number[]) {
    return { shotIds, state: 'PENDING' }
  }

  @Post('packageSingle/:shotId')
  @ApiOperation({ summary: '单个分镜打包' })
  @ApiParam({ name: 'shotId', example: 1, description: '分镜 ID' })
  packageSingle(@Param('shotId') shotId: string) {
    return { shotId, state: 'PENDING' }
  }
}
