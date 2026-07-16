import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { AppException } from './app-exception.js'
import { mapErrorToResponse } from './app-error.js'

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse()
    const request = host.switchToHttp().getRequest()

    if (exception instanceof AppException) {
      response.status(200).json(mapErrorToResponse({ kind: exception.kind, message: exception.message }))
      return
    }

    console.error('[AppErrorFilter] unhandled exception', {
      method: request?.method,
      url: request?.url,
      message: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    })
    response.status(200).json(mapErrorToResponse({ kind: 'unknown' }))
  }
}
