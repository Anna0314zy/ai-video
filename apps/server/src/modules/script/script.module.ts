import { Module } from '@nestjs/common'
import { LlmModule } from '../../llm/llm.module.js'
import { ScriptController } from './script.controller.js'
import { ScriptService } from './script.service.js'

@Module({
  imports: [LlmModule],
  controllers: [ScriptController],
  providers: [ScriptService],
})
export class ScriptModule {}
