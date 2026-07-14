import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('健康检查 Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查', description: '无需传参。' })
  health() {
    return { status: 'ok' }
  }
}
