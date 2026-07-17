import { Module } from '@nestjs/common'
import { LlmModule } from '../../llm/llm.module.js'
import { GenerationController } from './generation.controller.js'
import { GenerationService } from './generation.service.js'

@Module({
  imports: [LlmModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
