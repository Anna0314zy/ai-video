import { HttpException, HttpStatus } from '@nestjs/common'
import type { AppErrorKind } from './app-error.js'

export class AppException extends HttpException {
  constructor(
    readonly kind: AppErrorKind,
    message?: string,
    status = HttpStatus.OK,
  ) {
    super(message || kind, status)
  }
}
