import { Body, Controller, Headers, Inject, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoginDto } from '../../common/swagger-dto.js'
import { AuthService } from './auth.service.js'

@ApiTags('认证 Auth')
@Controller('classroom-slides/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @ApiBody({
    type: LoginDto,
    required: true,
    description: '首次提交用户名和密码时自动注册；用户已存在时校验密码，登录成功后返回 JWT token。',
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password)
  }

  @Post('check')
  @ApiOperation({ summary: '登录校验' })
  @ApiBody({
    type: LoginDto,
    required: false,
    description: '优先读取 Authorization: Bearer token；也兼容 body.systemToken。',
  })
  check(@Headers('authorization') authorization: string | undefined, @Body() body: Partial<LoginDto> = {}) {
    return this.authService.check(authorization || body.systemToken)
  }

  @Post('logout')
  @ApiOperation({ summary: '登出', description: '无需传参。' })
  logout() {
    return true
  }
}
