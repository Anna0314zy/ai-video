import { fail, type ApiResponse } from './api-response.js'

export type AppErrorKind =
  | 'validation'
  | 'invalid-credentials'
  | 'login-expired'
  | 'upstream-authentication'
  | 'upstream-timeout'
  | 'upstream-rate-limit'
  | 'upstream-unavailable'
  | 'feature-not-configured'
  | 'not-found'
  | 'unknown'

export interface AppErrorLike {
  kind: AppErrorKind
  message?: string
}

const ERROR_MAP: Record<AppErrorKind, { code: number; message: string }> = {
  validation: { code: 40000, message: '请求参数错误' },
  'invalid-credentials': { code: 40001, message: '用户名或密码错误' },
  'login-expired': { code: 30001, message: '登录过期，请重新登录' },
  'upstream-authentication': { code: 50201, message: '上游服务鉴权失败' },
  'upstream-timeout': { code: 50202, message: '上游服务请求超时' },
  'upstream-rate-limit': { code: 50203, message: '上游服务限流，请稍后重试' },
  'upstream-unavailable': { code: 50204, message: '上游服务暂不可用' },
  'feature-not-configured': { code: 50301, message: '功能尚未配置' },
  'not-found': { code: 40400, message: '资源不存在' },
  unknown: { code: 50000, message: '服务异常' },
}

export function mapErrorToResponse(error: AppErrorLike): ApiResponse<null> {
  const mapped = ERROR_MAP[error.kind] || ERROR_MAP.unknown
  return fail(mapped.code, canExposeMessage(error.kind) && error.message ? error.message : mapped.message)
}

function canExposeMessage(kind: AppErrorKind) {
  return kind === 'validation' || kind === 'feature-not-configured' || kind === 'not-found'
}
