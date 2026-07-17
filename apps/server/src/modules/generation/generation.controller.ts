import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AppException } from '../../common/app-exception.js'
import { AudioTaskDto, ImagePromptDto, ImageToVideoTaskDto, TextToImageTaskDto, TextToVideoTaskDto } from '../../common/swagger-dto.js'
import { GenerationService } from './generation.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'

@ApiTags('生成 Generation')
@Controller()
export class GenerationController {
  constructor(
    @Inject(GenerationService) private readonly generationService: GenerationService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

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
    return this.generationService.addTextToImageTask(body)
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
    return this.generationService.addImageToVideoTask(body)
  }

  @Post('api/prompt/v1/generateImage/parse')
  @ApiOperation({ summary: '生成图片 prompt' })
  @ApiBody({ type: ImagePromptDto })
  async generateImagePrompt(@Body() body: ImagePromptDto) {
    const shot = body.shotId ? await this.prisma.shot.findUnique({ where: { id: Number(body.shotId) } }) : null
    const manualPrompt = String((body as any).button?.btnValue || body.prompt || '').trim()
    const basePrompt = manualPrompt || shot?.visualPrompt || shot?.content || ''
    const imageHint = body.imageUrl ? `参考图：${body.imageUrl}` : ''
    const configPrompt = formatImageConfigPrompt((body as any).imageConfig)
    const prompt = [basePrompt, configPrompt, imageHint]
      .filter(Boolean)
      .join('\n')
      .trim()
    if (!prompt) throw new AppException('validation', '图片 prompt 不能为空')
    return prompt
  }

  @Get('api/prompt/v1/translate')
  @ApiOperation({ summary: 'Prompt 翻译' })
  @ApiQuery({ name: 'text', example: '一只纸飞机飞过教室', description: '待翻译文本' })
  async translate(@Query('text') text: string) {
    if (!text?.trim()) throw new AppException('validation', '待翻译文本不能为空')
    return this.generationService.translatePromptToEnglish(text, 'image')
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
    return this.generationService.addAudioTask(body)
  }

  @Post('api/queue/v1/task/reinstateTask')
  @ApiOperation({ summary: '任务重试' })
  @ApiQuery({ name: 'taskId', example: 'task-001', description: '任务 ID' })
  reinstateTask(@Query('taskId') taskId: string) {
    return this.generationService.reinstateTask(taskId)
  }

  @Get('api/queue/v1/task/detail')
  @ApiOperation({ summary: '查询任务详情，并同步上游任务状态' })
  @ApiQuery({ name: 'taskId', example: 'task-001', description: '任务 ID' })
  getTask(@Query('taskId') taskId: string) {
    return this.generationService.getTask(taskId)
  }
}

function formatImageConfigPrompt(config?: Record<string, unknown>) {
  if (!config) return ''
  const parts = [
    valueLine('画面主体', config.subject),
    valueLine('构图/镜头', config.composition),
    valueLine('视觉风格', config.style),
    valueLine('光线/氛围', config.lighting),
    valueLine('画幅比例', config.aspectRatio),
    valueLine('质量要求', config.quality),
    valueLine('色彩倾向', config.colorTone),
    valueLine('人物一致性', config.characterConsistency),
    valueLine('负向提示', config.negativePrompt),
  ].filter(Boolean)
  return parts.length ? `图片生成配置：${parts.join('；')}` : ''
}

function valueLine(label: string, value: unknown) {
  const text = String(value || '').trim()
  return text ? `${label}：${text}` : ''
}
