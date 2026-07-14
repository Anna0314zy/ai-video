import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { AppException } from './app-exception.js'
import { mapErrorToResponse } from './app-error.js'

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse()

    if (exception instanceof AppException) {
      response.status(200).json(mapErrorToResponse({ kind: exception.kind }))
      return
    }

    response.status(200).json(mapErrorToResponse({ kind: 'unknown' }))
  }
}
