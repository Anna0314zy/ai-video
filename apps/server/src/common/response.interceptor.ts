import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { ok } from './api-response.js'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    if (request?.headers?.accept === 'text/event-stream') {
      return next.handle()
    }

    return next.handle().pipe(
      map(data => {
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
          return data
        }
        return ok(data ?? null)
      }),
    )
  }
}
