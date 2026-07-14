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
    textToVideoProvider: string
    imageToVideoProvider?: string
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
      bucketName: env.QINIU_BUCKET_NAME || 'qiqi123456',
      accessKey: required(env, 'QINIU_ACCESS_KEY'),
      secretKey: required(env, 'QINIU_SECRET_KEY'),
      publicDomain: env.QINIU_PUBLIC_DOMAIN || '',
      uploadHost: env.QINIU_UPLOAD_HOST || 'https://upload.qiniup.com',
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
      textToVideoProvider: required(env, 'TEXT_TO_VIDEO_PROVIDER'),
      imageToVideoProvider: env.IMAGE_TO_VIDEO_PROVIDER,
    },
  }
}
