import assert from 'node:assert/strict'
import { buildServerConfig } from '../dist/config/server-config.js'
import { ok, fail } from '../dist/common/api-response.js'
import { mapErrorToResponse } from '../dist/common/app-error.js'
import { createLlmProvider } from '../dist/llm/llm-provider-factory.js'

const tests = []

function test(name, fn) {
  tests.push({ name, fn })
}

test('buildServerConfig loads DeepSeek script model from environment', () => {
  const config = buildServerConfig({
    PORT: '4100',
    AUTH_TOKEN_HEADER: 'Authorization',
    DATABASE_URL: 'file:./test.db',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_SECONDS: '3600',
    QINIU_BUCKET_NAME: 'qiqi123456',
    QINIU_ACCESS_KEY: 'access-key',
    QINIU_SECRET_KEY: 'secret-key',
    QINIU_PUBLIC_DOMAIN: 'https://cdn.example.com',
    LLM_PROVIDER: 'deepseek',
    LLM_BASE_URL: 'https://api.deepseek.com',
    LLM_API_KEY: 'llm-key',
    LLM_SCRIPT_MODEL: 'deepseek-chat',
    LLM_TIMEOUT_MS: '30000',
    LLM_RETRY_COUNT: '2',
    TEXT_TO_VIDEO_PROVIDER: 'tencent',
  })

  assert.equal(config.port, 4100)
  assert.equal(config.auth.jwtSecret, 'test-secret')
  assert.equal(config.auth.jwtExpiresSeconds, 3600)
  assert.equal(config.database.url, 'file:./test.db')
  assert.equal(config.storage.provider, 'qiniu')
  assert.equal(config.storage.bucketName, 'qiqi123456')
  assert.equal(config.llm.provider, 'deepseek')
  assert.equal(config.llm.scriptModel, 'deepseek-chat')
  assert.equal(config.generation.textToVideoProvider, 'tencent')
})

test('buildServerConfig fails when required LLM config is missing', () => {
  assert.throws(
    () =>
      buildServerConfig({
        JWT_SECRET: 'test-secret',
        QINIU_BUCKET_NAME: 'qiqi123456',
        QINIU_ACCESS_KEY: 'access-key',
        QINIU_SECRET_KEY: 'secret-key',
      }),
    /LLM_PROVIDER is required/,
  )
})

test('ok wraps data with frontend-compatible success code', () => {
  assert.deepEqual(ok({ id: 1 }, 'done'), {
    code: 200,
    message: 'done',
    data: { id: 1 },
  })
})

test('fail wraps errors with frontend-compatible structure', () => {
  assert.deepEqual(fail(30001, '登录过期，请重新登录'), {
    code: 30001,
    message: '登录过期，请重新登录',
    data: null,
  })
})

test('mapErrorToResponse hides upstream secret-bearing messages', () => {
  const response = mapErrorToResponse({
    kind: 'upstream-authentication',
    message: 'invalid api key sk-demo-secret',
  })

  assert.equal(response.code, 50201)
  assert.equal(response.message, '上游服务鉴权失败')
  assert.equal(response.data, null)
})

test('createLlmProvider creates DeepSeek provider from config', () => {
  const provider = createLlmProvider({
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com',
    apiKey: 'key',
    scriptModel: 'deepseek-chat',
    timeoutMs: 30000,
    retryCount: 1,
  })

  assert.equal(provider.name, 'deepseek')
  assert.equal(provider.defaultModel, 'deepseek-chat')
})

test('createLlmProvider rejects unsupported provider', () => {
  assert.throws(
    () =>
      createLlmProvider({
        provider: 'unknown',
        baseUrl: 'https://example.com',
        apiKey: 'key',
        scriptModel: 'model',
        timeoutMs: 30000,
        retryCount: 1,
      }),
    /Unsupported LLM provider: unknown/,
  )
})

let failed = 0

for (const { name, fn } of tests) {
  try {
    await fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    failed += 1
    console.error(`not ok - ${name}`)
    console.error(error)
  }
}

if (failed > 0) {
  process.exitCode = 1
}
