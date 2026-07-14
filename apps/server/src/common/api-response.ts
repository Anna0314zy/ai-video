export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

export function ok<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
  }
}

export function fail(code: number, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
  }
}
