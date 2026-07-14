import { Body, Controller, Get, Inject, Post, Query, Req } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PageDto, ProjectDeleteDto, ProjectSaveDto } from '../../common/swagger-dto.js'
import { ProjectService } from './project.service.js'

@ApiTags('项目 Project')
@Controller('api/project')
export class ProjectController {
  constructor(@Inject(ProjectService) private readonly projectService: ProjectService) {}

  @Post('page')
  @ApiOperation({ summary: '项目分页列表', description: '使用 Prisma 查询真实 SQLite 数据库。' })
  @ApiBody({ type: PageDto })
  page(@Body() body: PageDto, @Req() request: any) {
    return this.projectService.page(body, request.user)
  }

  @Post('save')
  @ApiOperation({ summary: '新建或更新项目', description: '写入真实数据库，传 id 时更新。' })
  @ApiBody({ type: ProjectSaveDto })
  save(@Body() body: ProjectSaveDto, @Req() request: any) {
    return this.projectService.save(body, request.user)
  }

  @Get('detail')
  @ApiOperation({ summary: '项目详情', description: '从真实数据库查询项目，并返回最近会话 ID。' })
  @ApiQuery({ name: 'projectId', example: 1, description: '项目 ID' })
  detail(@Query('projectId') projectId: string, @Req() request: any) {
    return this.projectService.detail(Number(projectId), request.user)
  }

  @Get('v1/listSubjectName')
  @ApiOperation({ summary: '学科列表', description: '无需传参。' })
  listSubjectName() {
    return ['语文', '数学', '英语']
  }

  @Get('v1/listTermName')
  @ApiOperation({ summary: '学期列表', description: '无需传参。' })
  listTermName() {
    return ['春季', '夏季', '秋季', '冬季']
  }

  @Post('delete')
  @ApiOperation({ summary: '批量删除项目', description: '从真实数据库删除项目。' })
  @ApiBody({ type: ProjectDeleteDto })
  delete(@Body('projectIdList') projectIdList: number[], @Req() request: any) {
    return this.projectService.delete(projectIdList || [], request.user)
  }
}
