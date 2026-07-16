import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import {
  CreateSessionDto,
  ConfirmScriptDto,
  DeleteScriptDto,
  GenerateShotPromptDto,
  PageScriptDto,
  ResendMessageDto,
  SaveScriptDto,
  SessionHistoriesDto,
  StreamChatDto,
} from '../../common/swagger-dto.js'
import { AppException } from '../../common/app-exception.js'
import { LlmService } from '../../llm/llm.service.js'
import type { LlmMessage } from '../../llm/llm-provider.js'
import { buildScriptTemplate, ScriptService } from './script.service.js'
import { withScriptMarkdownSystemPrompt } from './script-markdown.js'

@ApiTags('剧本 Script')
@Controller()
export class ScriptController {
  constructor(
    @Inject(ScriptService)
    private readonly scriptService: ScriptService,
    @Inject(LlmService)
    private readonly llmService: LlmService,
  ) {}

  @Post('api/session/create')
  @ApiOperation({ summary: '创建会话', description: '写入真实数据库 Session 表。' })
  @ApiBody({ type: CreateSessionDto })
  createChat(@Body('projectId') projectId: number, @Req() request: any) {
    return this.scriptService.createSession(projectId, request.user)
  }

  @Get('api/session/list')
  @ApiOperation({ summary: '项目会话列表', description: '查询一个项目下的多个会话，用于前端会话侧栏。' })
  @ApiQuery({ name: 'projectId', example: 1, description: '项目 ID' })
  listSessions(@Query('projectId') projectId: string) {
    return this.scriptService.listSessions({ projectId: Number(projectId) })
  }

  @Post('api/session/chat/getHistories')
  @ApiOperation({ summary: '会话历史分页', description: '从真实数据库 SessionMessage 表查询。' })
  @ApiBody({ type: SessionHistoriesDto })
  histories(@Body() body: SessionHistoriesDto) {
    return this.scriptService.histories(body)
  }

  @Post('api/prompt/v1/generateShot/parse')
  @ApiOperation({ summary: '生成剧本/分镜 prompt' })
  @ApiBody({ type: GenerateShotPromptDto })
  generateShotPrompt(@Body() body: GenerateShotPromptDto) {
    return this.scriptService.createShotPromptLog(body)
  }

  @Get('api/text/v1/listScriptStyle')
  @ApiOperation({ summary: '剧本风格列表', description: '无需传参。' })
  listScriptStyle() {
    return ['故事型', '讲解型', '互动型']
  }

  @Get('api/text/v1/listScriptType')
  @ApiOperation({ summary: '剧本类型列表', description: '无需传参。' })
  listScriptType() {
    return ['剧情', '名著', '古诗']
  }

  @Post('api/text/v2/saveScript')
  @ApiOperation({ summary: '保存剧本', description: '写入真实数据库 Script 表。' })
  @ApiBody({ type: SaveScriptDto })
  saveScript(@Body() body: SaveScriptDto, @Req() request: any) {
    return this.scriptService.saveScript(body, request.user)
  }

  @Post('api/text/v1/pageScript')
  @ApiOperation({ summary: '剧本分页列表', description: '从真实数据库 Script 表查询。' })
  @ApiBody({ type: PageScriptDto })
  pageScript(@Body() body: PageScriptDto) {
    return this.scriptService.pageScript(body)
  }

  @Get('api/text/v1/previewScript')
  @ApiOperation({ summary: '预览剧本' })
  @ApiQuery({ name: 'scriptId', example: 1, description: '剧本 ID' })
  previewScript(@Query('scriptId') scriptId: string) {
    return this.scriptService.previewScript(Number(scriptId))
  }

  @Post('api/text/v1/importScript/:projectId')
  @ApiOperation({ summary: '导入剧本' })
  @ApiParam({ name: 'projectId', example: 1, description: '项目 ID' })
  @UseInterceptors(FileInterceptor('file'))
  importScript(@Param('projectId') projectId: string, @UploadedFile() file: any, @Body() body: any, @Req() request: any) {
    const fileName = file?.originalname || body?.fileName || '剧本.md'
    const content = file?.buffer || body?.content || body?.text || ''
    if (!content) throw new AppException('validation', '请选择要导入的剧本文件')
    return this.scriptService.importScript(Number(projectId), fileName, content, request.user)
  }

  @Delete('api/text/v1/deleteScript')
  @ApiOperation({ summary: '删除剧本' })
  @ApiBody({ type: DeleteScriptDto, required: false })
  deleteScript(@Body() body?: DeleteScriptDto, @Query('scriptId') scriptId?: string) {
    const scriptIdList = body?.scriptIdList?.length ? body.scriptIdList : scriptId ? [Number(scriptId)] : []
    return this.scriptService.deleteScripts(scriptIdList)
  }

  @Put('api/text/v1/confirmScript')
  @ApiOperation({ summary: '确认剧本' })
  @ApiBody({ type: ConfirmScriptDto })
  confirmScript(@Body() body: Partial<ConfirmScriptDto> = {}, @Query('projectId') projectId?: string, @Query('scriptId') scriptId?: string) {
    return this.scriptService.confirmScript({
      ...body,
      projectId: body?.projectId || Number(projectId),
      scriptId: body?.scriptId || Number(scriptId),
    })
  }

  @Get('api/text/v1/downloadTemplate')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: '下载剧本模板', description: '无需传参。' })
  downloadTemplate(@Query('ext') ext: string, @Res() response: any) {
    const template = buildScriptTemplate(ext)
    response.setHeader('Content-Type', template.contentType)
    response.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(template.fileName)}"`)
    response.send(template.content)
  }

  @Get('api/text/v1/downloadScript')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: '下载剧本' })
  @ApiQuery({ name: 'scriptId', example: 1, description: '剧本 ID' })
  async downloadScript(@Query('scriptId') scriptId: string, @Res() response: any) {
    const script = await this.scriptService.previewScript(Number(scriptId))
    response.send(script.scriptText || '')
  }

  @Post('api/text/v1/ai/stream/sessionChat')
  @Sse()
  @ApiOperation({ summary: 'SSE 流式生成剧本' })
  @ApiBody({ type: StreamChatDto })
  streamChat(@Body() body: StreamChatDto) {
    return this.streamFromPrompt(body.text || '')
  }

  @Post('api/text/v1/ai/stream/resendMessage')
  @Sse()
  @ApiOperation({ summary: 'SSE 重新生成消息' })
  @ApiBody({ type: ResendMessageDto })
  resend(@Body() body: ResendMessageDto) {
    return new Observable(subscriber => {
      void (async () => {
        const messages = await this.scriptService.buildResendMessages(body)
        await this.streamMessagesToSubscriber(messages, subscriber)
      })().catch(error => subscriber.error(error))
    })
  }

  private streamFromPrompt(prompt: string) {
    return new Observable(subscriber => {
      void (async () => {
        await this.streamMessagesToSubscriber([{ role: 'user', content: prompt }], subscriber)
      })().catch(error => subscriber.error(error))
    })
  }

  private async streamMessagesToSubscriber(messages: LlmMessage[], subscriber: any) {
    for await (const chunk of this.llmService.streamScript(withScriptMarkdownSystemPrompt(messages))) {
      subscriber.next({ data: chunk.content })
      if (chunk.done) subscriber.complete()
    }
  }
}
