import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { AuthService } from '../modules/auth/auth.service.js'
import { AppException } from './app-exception.js'

const PUBLIC_PATHS = ['/classroom-slides/auth/login', '/health']
const PUBLIC_PREFIXES = ['/api-docs']

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    if (PUBLIC_PATHS.includes(request.path)) return true
    if (PUBLIC_PREFIXES.some(prefix => request.path.startsWith(prefix))) return true

    try {
      request.user = await this.authService.verifyRequestToken(request.headers.authorization)
      return true
    } catch {
      throw new AppException('login-expired')
    }
  }
}
