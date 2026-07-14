import { Body, Controller, Delete, Get, Header, Inject, Param, Post, Put, Query, Req, Res, Sse } from '@nestjs/common'
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
import { LlmService } from '../../llm/llm.service.js'
import { ScriptService } from './script.service.js'

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
    return {
      prompt: JSON.stringify(body),
      promptRequestLogId: Date.now(),
    }
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
    return `script preview: ${scriptId}`
  }

  @Post('api/text/v1/importScript/:projectId')
  @ApiOperation({ summary: '导入剧本' })
  @ApiParam({ name: 'projectId', example: 1, description: '项目 ID' })
  importScript(@Param('projectId') projectId: string) {
    return [`project-${projectId}-imported-script`]
  }

  @Delete('api/text/v1/deleteScript')
  @ApiOperation({ summary: '删除剧本' })
  @ApiBody({ type: DeleteScriptDto, required: false })
  deleteScript(@Body() body?: DeleteScriptDto) {
    return true
  }

  @Put('api/text/v1/confirmScript')
  @ApiOperation({ summary: '确认剧本' })
  @ApiBody({ type: ConfirmScriptDto })
  confirmScript(@Body() body: ConfirmScriptDto) {
    return true
  }

  @Get('api/text/v1/downloadTemplate')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: '下载剧本模板', description: '无需传参。' })
  downloadTemplate(@Res() response: any) {
    response.send('剧本模板')
  }

  @Get('api/text/v1/downloadScript')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: '下载剧本' })
  @ApiQuery({ name: 'scriptId', example: 1, description: '剧本 ID' })
  downloadScript(@Query('scriptId') scriptId: string, @Res() response: any) {
    response.send(`script-${scriptId}`)
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
    return this.streamFromPrompt(`重新生成 ${body.sessionChatId || ''}`)
  }

  private streamFromPrompt(prompt: string) {
    return new Observable(subscriber => {
      void (async () => {
        for await (const chunk of this.llmService.streamScript([{ role: 'user', content: prompt }])) {
          subscriber.next({ data: chunk.content })
          if (chunk.done) subscriber.complete()
        }
      })().catch(error => subscriber.error(error))
    })
  }
}
