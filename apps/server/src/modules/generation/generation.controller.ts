import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AudioTaskDto, ImagePromptDto, ImageToVideoTaskDto, TextToImageTaskDto, TextToVideoTaskDto } from '../../common/swagger-dto.js'
import { GenerationService } from './generation.service.js'

@ApiTags('生成 Generation')
@Controller()
export class GenerationController {
  constructor(@Inject(GenerationService) private readonly generationService: GenerationService) {}

  @Get('api/prompt/v1/parseMJPrompt/btnList')
  @ApiOperation({ summary: '获取图片 prompt 按钮列表' })
  @ApiQuery({ name: 'shotId', required: false, example: 1, description: '分镜 ID' })
  imageButtons(@Query('shotId') shotId: string) {
    return [{ btnType: 'style', btnName: '默认', btnValue: shotId }]
  }

  @Post('api/text2image/v1/mj/text2image/addTask')
  @ApiOperation({ summary: '创建文生图任务' })
  @ApiBody({ type: TextToImageTaskDto })
  addTextToImageTask(@Body() body: TextToImageTaskDto) {
    return this.generationService.addTextToImageTask()
  }

  @Post('api/text2video/v1/generateVideo/addTask')
  @ApiOperation({ summary: '创建文生视频任务' })
  @ApiBody({ type: TextToVideoTaskDto })
  addTextToVideoTask(@Body() body: TextToVideoTaskDto) {
    return this.generationService.addTextToVideoTask(body)
  }

  @Post('api/image2video/v1/svd/generateVideo/addTask')
  @ApiOperation({ summary: '创建图生视频任务' })
  @ApiBody({ type: ImageToVideoTaskDto })
  addImageToVideoTask(@Body() body: ImageToVideoTaskDto) {
    return this.generationService.addImageToVideoTask()
  }

  @Post('api/prompt/v1/generateImage/parse')
  @ApiOperation({ summary: '生成图片 prompt' })
  @ApiBody({ type: ImagePromptDto })
  generateImagePrompt(@Body() body: ImagePromptDto) {
    return JSON.stringify(body)
  }

  @Get('api/prompt/v1/translate')
  @ApiOperation({ summary: 'Prompt 翻译' })
  @ApiQuery({ name: 'text', example: '一只纸飞机飞过教室', description: '待翻译文本' })
  translate(@Query('text') text: string) {
    return text
  }

  @Get('api/tts/v1/languages')
  @ApiOperation({ summary: 'TTS 语言列表', description: '无需传参。' })
  languages() {
    return { localeNameElementRespList: [{ description: '中文', value: 'zh-CN' }] }
  }

  @Get('api/tts/v1/voices/:localeName')
  @ApiOperation({ summary: 'TTS 声音列表' })
  @ApiParam({ name: 'localeName', example: 'zh-CN', description: '语言区域' })
  voices(@Param('localeName') localeName: string) {
    return { voiceElementRespList: [{ description: localeName, value: 'default' }] }
  }

  @Get('api/tts/v1/styles/:voice')
  @ApiOperation({ summary: 'TTS 风格列表' })
  @ApiParam({ name: 'voice', example: 'default', description: '声音 ID' })
  styles(@Param('voice') voice: string) {
    return { styleElementRespList: [{ description: voice, value: 'general' }] }
  }

  @Get('api/tts/v1/otherOptions')
  @ApiOperation({ summary: 'TTS 其他参数', description: '无需传参。' })
  otherOptions() {
    return {
      pitchElementRespList: [],
      rateElementRespList: [],
    }
  }

  @Post('api/tts/v1/genVoices')
  @ApiOperation({ summary: '创建 TTS 音频任务' })
  @ApiBody({ type: AudioTaskDto })
  addAudioTask(@Body() body: AudioTaskDto) {
    return { taskId: `tts-${Date.now()}`, state: 'PENDING', ...body }
  }

  @Post('api/queue/v1/task/reinstateTask')
  @ApiOperation({ summary: '任务重试' })
  @ApiQuery({ name: 'taskId', example: 'task-001', description: '任务 ID' })
  reinstateTask(@Query('taskId') taskId: string) {
    return { taskId, state: 'PENDING' }
  }
}
