import { Controller, Get, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

interface AuthenticatedRequest {
  user?: {
    id: number
    accountId: string
    username: string
    workcode: string | null
    email: string | null
  }
}

@ApiTags('账号 Account')
@Controller('api/account/userInfo')
export class AccountController {
  @Get('get')
  @ApiOperation({ summary: '获取当前用户信息', description: '无需传参，从 JWT 中识别当前用户。' })
  getUserInfo(@Req() request: AuthenticatedRequest) {
    const user = request.user
    return {
      accountId: user?.accountId || '',
      uid: user?.id || 0,
      username: user?.username || '',
      workcode: user?.workcode || '',
      email: user?.email || '',
    }
  }
}
