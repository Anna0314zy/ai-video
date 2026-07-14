import { Module } from '@nestjs/common'
import { ResourceController } from './resource.controller.js'
import { ShotController } from './shot.controller.js'

@Module({
  controllers: [ResourceController, ShotController],
})
export class CommonModule {}
