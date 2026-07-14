import { Inject, Injectable } from '@nestjs/common'
import { AppException } from '../../common/app-exception.js'
import { ConfigService } from '../../config/config.service.js'
import { TencentTextToVideoProvider } from './tencent-text-to-video.provider.js'

@Injectable()
export class GenerationService {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  addTextToImageTask() {
    if (!this.configService.value.generation.textToImageProvider) {
      throw new AppException('feature-not-configured', '文生图 provider 尚未配置')
    }
  }

  addImageToVideoTask() {
    if (!this.configService.value.generation.imageToVideoProvider) {
      throw new AppException('feature-not-configured', '图生视频 provider 尚未配置')
    }
  }

  async addTextToVideoTask(params: any) {
    const provider = new TencentTextToVideoProvider()
    return provider.createTask({
      kind: 'text-to-video',
      prompt: params.prompt,
      metadata: params,
    })
  }
}
