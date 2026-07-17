import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
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

    if (exception instanceof BadRequestException) {
      response.status(200).json(
        mapErrorToResponse({
          kind: 'validation',
          message: formatBadRequestMessage(exception.getResponse()),
        }),
      )
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

function formatBadRequestMessage(errorResponse: unknown) {
  if (typeof errorResponse === 'string') return errorResponse
  if (!errorResponse || typeof errorResponse !== 'object') return '请求参数错误'
  const message = (errorResponse as { message?: unknown }).message
  if (Array.isArray(message)) return message.join('；')
  if (typeof message === 'string') return message
  return '请求参数错误'
}
