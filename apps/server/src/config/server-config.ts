export interface ServerConfig {
  port: number
  auth: {
    tokenHeader: string
    jwtSecret: string
    jwtExpiresSeconds: number
  }
  database: {
    url: string
  }
  storage: {
    provider: 'qiniu'
    bucketName: string
    accessKey: string
    secretKey: string
    publicDomain: string
    uploadHost: string
    tokenExpiresSeconds: number
  }
  llm: {
    provider: string
    baseUrl: string
    apiKey: string
    scriptModel: string
    timeoutMs: number
    retryCount: number
  }
  generation: {
    textToImageProvider?: string
    textToImageBaseUrl: string
    textToImageApiKey?: string
    textToImageModel: string
    textToImageSize: string
    textToImageQuality: string
    textToImageResponseFormat: string
    textToImageWatermark: boolean
    textToImageTimeoutMs: number
    textToVideoProvider: string
    imageToVideoProvider?: string
    textToVideoBaseUrl: string
    textToVideoApiStyle: string
    textToVideoApiKey?: string
    textToVideoModel: string
    textToVideoDuration: number
    textToVideoRatio: string
    textToVideoTimeoutMs: number
  }
}

type Env = Record<string, string | undefined>

function required(env: Env, key: string): string {
  const value = env[key]
  if (!value) {
    throw new Error(`${key} is required`)
  }
  return value
}

function optionalNumber(env: Env, key: string, fallback: number): number {
  const raw = env[key]
  if (!raw) return fallback

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} must be a non-negative number`)
  }
  return parsed
}

function optionalBoolean(env: Env, key: string, fallback: boolean): boolean {
  const raw = env[key]
  if (!raw) return fallback
  if (raw === 'true' || raw === '1') return true
  if (raw === 'false' || raw === '0') return false
  throw new Error(`${key} must be a boolean`)
}

export function buildServerConfig(env: Env = process.env): ServerConfig {
  return {
    port: optionalNumber(env, 'PORT', 4000),
    auth: {
      tokenHeader: env.AUTH_TOKEN_HEADER || 'Authorization',
      jwtSecret: required(env, 'JWT_SECRET'),
      jwtExpiresSeconds: optionalNumber(env, 'JWT_EXPIRES_SECONDS', 86_400),
    },
    database: {
      url: env.DATABASE_URL || 'file:./dev.db',
    },
    storage: {
      provider: 'qiniu',
      bucketName: env.QINIU_BUCKET_NAME || 'qiqi1234567',
      accessKey: required(env, 'QINIU_ACCESS_KEY'),
      secretKey: required(env, 'QINIU_SECRET_KEY'),
      publicDomain: env.QINIU_PUBLIC_DOMAIN || '',
      uploadHost: env.QINIU_UPLOAD_HOST || 'https://up-z1.qiniup.com',
      tokenExpiresSeconds: optionalNumber(env, 'QINIU_TOKEN_EXPIRES_SECONDS', 3600),
    },
    llm: {
      provider: required(env, 'LLM_PROVIDER'),
      baseUrl: required(env, 'LLM_BASE_URL'),
      apiKey: required(env, 'LLM_API_KEY'),
      scriptModel: required(env, 'LLM_SCRIPT_MODEL'),
      timeoutMs: optionalNumber(env, 'LLM_TIMEOUT_MS', 60_000),
      retryCount: optionalNumber(env, 'LLM_RETRY_COUNT', 1),
    },
    generation: {
      textToImageProvider: env.TEXT_TO_IMAGE_PROVIDER,
      textToImageBaseUrl: env.TEXT_TO_IMAGE_BASE_URL || env.KUAIPAO_IMAGE_BASE_URL || 'https://kuaipao.pro/v1',
      textToImageApiKey: env.TEXT_TO_IMAGE_API_KEY || env.KUAIPAO_API_KEY,
      textToImageModel: env.TEXT_TO_IMAGE_MODEL || env.KUAIPAO_IMAGE_MODEL || 'gpt-image-2',
      textToImageSize: env.TEXT_TO_IMAGE_SIZE || env.KUAIPAO_IMAGE_SIZE || '1536x1024',
      textToImageQuality: env.TEXT_TO_IMAGE_QUALITY || env.KUAIPAO_IMAGE_QUALITY || 'auto',
      textToImageResponseFormat: env.TEXT_TO_IMAGE_RESPONSE_FORMAT || env.KUAIPAO_IMAGE_RESPONSE_FORMAT || 'url',
      textToImageWatermark: optionalBoolean(env, 'TEXT_TO_IMAGE_WATERMARK', optionalBoolean(env, 'KUAIPAO_IMAGE_WATERMARK', false)),
      textToImageTimeoutMs: optionalNumber(env, 'TEXT_TO_IMAGE_TIMEOUT_MS', 60_000),
      textToVideoProvider: required(env, 'TEXT_TO_VIDEO_PROVIDER'),
      imageToVideoProvider: env.IMAGE_TO_VIDEO_PROVIDER,
      textToVideoBaseUrl: env.TEXT_TO_VIDEO_BASE_URL || env.KUAIPAO_BASE_URL || 'https://kuaipao.pro',
      textToVideoApiStyle: env.TEXT_TO_VIDEO_API_STYLE || env.KUAIPAO_VIDEO_API_STYLE || 'native',
      textToVideoApiKey: env.TEXT_TO_VIDEO_API_KEY || env.KUAIPAO_API_KEY || env.TEXT_TO_IMAGE_API_KEY,
      textToVideoModel: env.TEXT_TO_VIDEO_MODEL || env.KUAIPAO_VIDEO_MODEL || 'seedance-2-0',
      textToVideoDuration: optionalNumber(env, 'TEXT_TO_VIDEO_DURATION', optionalNumber(env, 'KUAIPAO_VIDEO_DURATION', 5)),
      textToVideoRatio: env.TEXT_TO_VIDEO_RATIO || env.KUAIPAO_VIDEO_RATIO || '16:9',
      textToVideoTimeoutMs: optionalNumber(env, 'TEXT_TO_VIDEO_TIMEOUT_MS', 60_000),
    },
  }
}
