import assert from 'node:assert/strict'
import { buildServerConfig } from '../dist/config/server-config.js'
import { ok, fail } from '../dist/common/api-response.js'
import { mapErrorToResponse } from '../dist/common/app-error.js'
import { createLlmProvider } from '../dist/llm/llm-provider-factory.js'
import { ScriptService, buildScriptTemplate, parseImportedScript } from '../dist/modules/script/script.service.js'
import { GenerationService } from '../dist/modules/generation/generation.service.js'

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
    QINIU_BUCKET_NAME: 'qiqi1234567',
    QINIU_ACCESS_KEY: 'access-key',
    QINIU_SECRET_KEY: 'secret-key',
    QINIU_PUBLIC_DOMAIN: 'https://cdn.example.com',
    LLM_PROVIDER: 'deepseek',
    LLM_BASE_URL: 'https://api.deepseek.com',
    LLM_API_KEY: 'llm-key',
    LLM_SCRIPT_MODEL: 'deepseek-chat',
    LLM_TIMEOUT_MS: '30000',
    LLM_RETRY_COUNT: '2',
    TEXT_TO_VIDEO_PROVIDER: 'kuaipao',
    TEXT_TO_VIDEO_BASE_URL: 'https://kuaipao.pro',
    TEXT_TO_VIDEO_API_KEY: 'video-key',
    TEXT_TO_VIDEO_API_STYLE: 'native',
    TEXT_TO_VIDEO_MODEL: 'seedance-2-0',
    TEXT_TO_VIDEO_DURATION: '5',
    TEXT_TO_VIDEO_RATIO: '16:9',
    TEXT_TO_IMAGE_PROVIDER: 'kuaipao',
    TEXT_TO_IMAGE_BASE_URL: 'https://kuaipao.pro/v1',
    TEXT_TO_IMAGE_API_KEY: 'image-key',
    TEXT_TO_IMAGE_MODEL: 'gpt-image-2',
    TEXT_TO_IMAGE_SIZE: '1536x1024',
    TEXT_TO_IMAGE_QUALITY: 'auto',
    TEXT_TO_IMAGE_RESPONSE_FORMAT: 'url',
    TEXT_TO_IMAGE_WATERMARK: 'false',
  })

  assert.equal(config.port, 4100)
  assert.equal(config.auth.jwtSecret, 'test-secret')
  assert.equal(config.auth.jwtExpiresSeconds, 3600)
  assert.equal(config.database.url, 'file:./test.db')
  assert.equal(config.storage.provider, 'qiniu')
  assert.equal(config.storage.bucketName, 'qiqi1234567')
  assert.equal(config.llm.provider, 'deepseek')
  assert.equal(config.llm.scriptModel, 'deepseek-chat')
  assert.equal(config.generation.textToVideoProvider, 'kuaipao')
  assert.equal(config.generation.textToVideoBaseUrl, 'https://kuaipao.pro')
  assert.equal(config.generation.textToVideoApiStyle, 'native')
  assert.equal(config.generation.textToVideoApiKey, 'video-key')
  assert.equal(config.generation.textToVideoModel, 'seedance-2-0')
  assert.equal(config.generation.textToVideoDuration, 5)
  assert.equal(config.generation.textToVideoRatio, '16:9')
  assert.equal(config.generation.textToImageProvider, 'kuaipao')
  assert.equal(config.generation.textToImageBaseUrl, 'https://kuaipao.pro/v1')
  assert.equal(config.generation.textToImageApiKey, 'image-key')
  assert.equal(config.generation.textToImageModel, 'gpt-image-2')
  assert.equal(config.generation.textToImageSize, '1536x1024')
  assert.equal(config.generation.textToImageQuality, 'auto')
  assert.equal(config.generation.textToImageResponseFormat, 'url')
  assert.equal(config.generation.textToImageWatermark, false)
})

test('buildServerConfig fails when required LLM config is missing', () => {
  assert.throws(
    () =>
      buildServerConfig({
        JWT_SECRET: 'test-secret',
        QINIU_BUCKET_NAME: 'qiqi1234567',
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

test('GenerationService creates kuaipao text-to-video task with configured payload', async () => {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return {
      ok: true,
      text: async () => JSON.stringify({ data: { task_id: 'upstream-video-1', status: 'processing' } }),
    }
  }

  const createdTasks = []
  const updates = []
  const service = new GenerationService(
    {
      value: {
        generation: {
          textToVideoProvider: 'kuaipao',
          imageToVideoProvider: undefined,
          textToVideoBaseUrl: 'https://kuaipao.pro',
          textToVideoApiStyle: 'native',
          textToVideoApiKey: 'video-key',
          textToVideoModel: 'seedance-2-0',
          textToVideoDuration: 5,
          textToVideoRatio: '16:9',
          textToVideoTimeoutMs: 60000,
        },
      },
    },
    {
      shot: {
        findUnique: async query => {
          assert.deepEqual(query.where, { id: 3 })
          return {
            id: 3,
            duration: 6,
            videoPrompt: '镜头缓慢推进，电影感光影',
            content: '橘猫在窗台上伸懒腰',
          }
        },
        update: async query => {
          updates.push(query)
          return query.data
        },
      },
      generationTask: {
        create: async query => {
          createdTasks.push(query.data)
          return {
            id: 21,
            ...query.data,
            createdAt: new Date('2026-07-16T08:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
          }
        },
        update: async query => {
          updates.push(query)
          return {
            id: 21,
            taskId: 'text-to-video-local',
            provider: 'kuaipao',
            type: 'text-to-video',
            state: 'RUNNING',
            request: createdTasks[0].request,
            result: query.data.result,
            createdAt: new Date('2026-07-16T08:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
          }
        },
      },
    },
  )

  try {
    const task = await service.addTextToVideoTask({ shotId: 3, text: '一只橘猫在阳光下的窗台上伸懒腰' })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, 'https://kuaipao.pro/api/v3/contents/generations/tasks')
    assert.equal(calls[0].init.method, 'POST')
    assert.equal(calls[0].init.headers.Authorization, 'Bearer video-key')
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      model: 'seedance-2-0',
      content: [{ type: 'text', text: '一只橘猫在阳光下的窗台上伸懒腰' }],
      duration: 6,
      ratio: '16:9',
    })
    assert.equal(task.type, 'video')
    assert.equal(task.taskType, 'text-to-video')
    assert.equal(task.taskState, 'Processing')
    assert.equal(task.shotId, 3)
    assert.equal(task.result.upstreamTaskId, 'upstream-video-1')
    assert.deepEqual(updates[0], {
      where: { id: 3 },
      data: { videoStatus: 'running' },
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('GenerationService creates kuaipao image-to-video task with image content', async () => {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return {
      ok: true,
      text: async () => JSON.stringify({ id: 'upstream-image-video-1', status: 'processing' }),
    }
  }

  const createdTasks = []
  const service = new GenerationService(
    {
      value: {
        generation: {
          textToVideoProvider: 'kuaipao',
          imageToVideoProvider: 'kuaipao',
          textToVideoBaseUrl: 'https://kuaipao.pro',
          textToVideoApiStyle: 'native',
          textToVideoApiKey: 'video-key',
          textToVideoModel: 'seedance-2-0',
          textToVideoDuration: 5,
          textToVideoRatio: '16:9',
          textToVideoTimeoutMs: 60000,
        },
      },
    },
    {
      shot: {
        findUnique: async query => {
          assert.deepEqual(query.where, { id: 8 })
          return {
            id: 8,
            duration: 5,
            videoPrompt: 'Camera slowly moves forward.',
            content: '哪吒在海边奔跑',
          }
        },
        update: async query => query.data,
      },
      generationTask: {
        create: async query => {
          createdTasks.push(query.data)
          return {
            id: 28,
            ...query.data,
            createdAt: new Date('2026-07-16T08:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
          }
        },
        update: async query => ({
          id: 28,
          taskId: 'image-to-video-local',
          provider: 'kuaipao',
          type: 'image-to-video',
          state: 'RUNNING',
          request: createdTasks[0].request,
          result: query.data.result,
          createdAt: new Date('2026-07-16T08:00:00.000Z'),
          updatedAt: new Date('2026-07-16T08:00:00.000Z'),
        }),
      },
    },
  )

  try {
    const task = await service.addImageToVideoTask({
      shotId: 8,
      imageUrl: 'http://tiawcjly5.hb-bkt.clouddn.com/mj-image/demo.jpg',
      prompt: 'Camera slowly moves forward.',
      duration: 5,
      ratio: '16:9',
    })

    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, 'https://kuaipao.pro/api/v3/contents/generations/tasks')
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      model: 'seedance-2-0',
      content: [
        {
          type: 'image',
          url: 'http://tiawcjly5.hb-bkt.clouddn.com/mj-image/demo.jpg',
        },
        {
          type: 'text',
          text: 'Camera slowly moves forward.',
        },
      ],
      duration: 5,
      ratio: '16:9',
    })
    assert.equal(task.taskType, 'image-to-video')
    assert.equal(task.result.upstreamTaskId, 'upstream-image-video-1')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('GenerationService creates kuaipao text-to-image task and saves image resource', async () => {
  const calls = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    if (url === 'https://cdn.example.com/image.png') {
      return {
        ok: true,
        headers: { get: name => (String(name).toLowerCase() === 'content-type' ? 'image/png' : null) },
        arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      }
    }
    if (url === 'https://up-z1.qiniup.com') {
      return {
        ok: true,
        text: async () => JSON.stringify({ key: 'mj-image/generated.png' }),
      }
    }
    return {
      ok: true,
      text: async () => JSON.stringify({ data: [{ url: 'https://cdn.example.com/image.png' }] }),
    }
  }

  const createdTasks = []
  const updates = []
  const resources = []
  const service = new GenerationService(
    {
      value: {
        generation: {
          textToImageProvider: 'kuaipao',
          textToImageBaseUrl: 'https://kuaipao.pro/v1',
          textToImageApiKey: 'image-key',
          textToImageModel: 'gpt-image-2',
          textToImageSize: '1536x1024',
          textToImageQuality: 'auto',
          textToImageResponseFormat: 'url',
          textToImageWatermark: false,
          textToImageTimeoutMs: 60000,
        },
        storage: {
          bucketName: 'qiqi1234567',
          accessKey: 'qiniu-access-key',
          secretKey: 'qiniu-secret-key',
          uploadHost: 'https://up-z1.qiniup.com',
          tokenExpiresSeconds: 3600,
        },
      },
    },
    {
      shot: {
        findUnique: async query => {
          assert.deepEqual(query.where, { id: 5 })
          return {
            id: 5,
            visualPrompt: '现代 API 平台首页插图，白底，青蓝色块，干净留白',
            content: '现代 API 平台首页',
          }
        },
        update: async query => {
          updates.push(query)
          return query.data
        },
      },
      resource: {
        create: async query => {
          resources.push(query.data)
          return {
            id: 31,
            ...query.data,
          }
        },
      },
      generationTask: {
        create: async query => {
          createdTasks.push(query.data)
          return {
            id: 22,
            ...query.data,
            createdAt: new Date('2026-07-16T08:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
          }
        },
        update: async query => {
          updates.push(query)
          return {
            id: 22,
            taskId: 'text-to-image-local',
            provider: 'kuaipao',
            type: 'text-to-image',
            state: query.data.state || 'SUCCESS',
            request: createdTasks[0].request,
            result: query.data.result,
            createdAt: new Date('2026-07-16T08:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
          }
        },
      },
    },
  )

  try {
    const task = await service.addTextToImageTask({ shotId: 5 })
    assert.equal(calls.length, 3)
    assert.equal(calls[0].url, 'https://kuaipao.pro/v1/images/generations')
    assert.equal(calls[0].init.method, 'POST')
    assert.equal(calls[0].init.headers.Authorization, 'Bearer image-key')
    assert.equal(calls[1].url, 'https://cdn.example.com/image.png')
    assert.equal(calls[2].url, 'https://up-z1.qiniup.com')
    assert.equal(calls[2].init.method, 'POST')
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      model: 'gpt-image-2',
      prompt: '现代 API 平台首页插图，白底，青蓝色块，干净留白',
      n: 1,
      size: '1536x1024',
      quality: 'auto',
      response_format: 'url',
      watermark: false,
    })
    assert.equal(resources.length, 0)
    assert.equal(task.type, 'image')
    assert.equal(task.taskType, 'text-to-image')
    assert.equal(task.taskState, 'Completed')
    assert.match(task.originUrl, /^mj-image\/.+\.png$/)
    assert.equal(task.resourceId, undefined)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('ScriptService lists project sessions with generated display metadata', async () => {
  const service = new ScriptService({
    session: {
      findMany: async query => {
        assert.deepEqual(query.where, { projectId: 7 })
        assert.deepEqual(query.orderBy, [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }, { id: 'desc' }])
        return [
          {
            id: 3,
            projectId: 7,
            title: '太阳系科普剧本',
            lastMessageAt: new Date('2026-07-16T08:00:00.000Z'),
            createdAt: new Date('2026-07-16T07:00:00.000Z'),
            updatedAt: new Date('2026-07-16T08:00:00.000Z'),
            _count: { messages: 2 },
          },
        ]
      },
    },
  })

  const sessions = await service.listSessions({ projectId: 7 })

  assert.deepEqual(sessions, [
    {
      id: 3,
      projectId: 7,
      title: '太阳系科普剧本',
      lastMessageAt: '2026-07-16T08:00:00.000Z',
      createdAt: '2026-07-16T07:00:00.000Z',
      updatedAt: '2026-07-16T08:00:00.000Z',
      messageCount: 2,
    },
  ])
})

test('ScriptService updates a new session title from the first user message', async () => {
  const updates = []
  const service = new ScriptService({
    session: {
      findUnique: async query => {
        assert.deepEqual(query.where, { id: 9 })
        return { id: 9, title: '新会话' }
      },
      update: async query => {
        updates.push(query)
        return query.data
      },
    },
  })

  await service.touchSessionAfterMessage(9, '帮我生成一个太阳系科普剧本，适合三年级学生观看')

  assert.equal(updates.length, 1)
  assert.deepEqual(updates[0], {
    where: { id: 9 },
    data: {
      title: '帮我生成一个太阳系科普剧本，适合三年级学',
      lastMessageAt: updates[0].data.lastMessageAt,
    },
  })
  assert.ok(updates[0].data.lastMessageAt instanceof Date)
})

test('ScriptService creates an editable natural language prompt while storing raw prompt params', async () => {
  const tasks = []
  const service = new ScriptService({
    generationTask: {
      create: async query => {
        tasks.push(query.data)
        return {
          id: 9,
          taskId: query.data.taskId,
        }
      },
    },
  })

  const result = await service.createShotPromptLog({
    scriptType: '剧情',
    scriptStyle: '故事型',
    duration: 120,
    shotNum: 14,
    wordNum: 600,
    characters: '哪吒',
    scriptContent: '哪吒脑海',
  })

  assert.match(result.prompt, /请生成一个剧情类型、故事型风格的剧本/)
  assert.match(result.prompt, /主题：哪吒脑海/)
  assert.match(result.prompt, /主角：哪吒/)
  assert.match(result.prompt, /总时长：120 秒/)
  assert.match(result.prompt, /镜头数量：14 个/)
  assert.doesNotMatch(result.prompt, /^\{/)
  assert.equal(result.promptRequestLogId, 9)
  assert.deepEqual(JSON.parse(tasks[0].request), {
    scriptType: '剧情',
    scriptStyle: '故事型',
    duration: 120,
    shotNum: 14,
    wordNum: 600,
    characters: '哪吒',
    scriptContent: '哪吒脑海',
  })
})

test('buildScriptTemplate exposes script-level fields without project context fields', () => {
  const template = buildScriptTemplate('md')

  assert.match(template.content, /剧本标题/)
  assert.match(template.content, /剧本正文/)
  assert.match(template.content, /剧本风格/)
  assert.doesNotMatch(template.content, /学科/)
  assert.doesNotMatch(template.content, /年级/)
  assert.equal(template.fileName, '剧本模板.md')
})

test('parseImportedScript reads markdown template fields', () => {
  const parsed = parseImportedScript(
    `# 剧本标题\n\n春晓讲解剧本\n\n# 剧本正文\n\n这是完整剧本。\n\n# 剧本信息\n\n- 剧本类型：讲解\n- 剧本风格：故事型\n- 期望镜头数量：6\n- 备注：课堂导入`,
    'demo.md',
  )

  assert.equal(parsed.title, '春晓讲解剧本')
  assert.equal(parsed.content, '这是完整剧本。')
  assert.equal(parsed.scriptType, '讲解')
  assert.equal(parsed.scriptStyle, '故事型')
  assert.equal(parsed.shotNum, 6)
  assert.equal(parsed.remark, '课堂导入')
})

test('parseImportedScript reads csv template fields', () => {
  const parsed = parseImportedScript(
    '剧本标题,剧本正文,剧本类型,预计总时长（秒）\n太阳系科普,"第一段,第二段",讲解,120',
    'demo.csv',
  )

  assert.equal(parsed.title, '太阳系科普')
  assert.equal(parsed.content, '第一段,第二段')
  assert.equal(parsed.scriptType, '讲解')
  assert.equal(parsed.duration, 120)
})

test('ScriptService saves assistant message as an ai script', async () => {
  const createdScripts = []
  const service = new ScriptService({
    project: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 7, ownerId: 1 })
        return { id: 7 }
      },
    },
    sessionMessage: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 11, sessionId: 3, role: 'assistant' })
        return {
          id: 11,
          sessionId: 3,
          content: '# 春晓讲解\n\n这里是剧本正文。',
        }
      },
    },
    script: {
      create: async query => {
        createdScripts.push(query.data)
        return {
          id: 5,
          ...query.data,
          createdAt: new Date('2026-07-16T08:00:00.000Z'),
          updatedAt: new Date('2026-07-16T08:00:00.000Z'),
        }
      },
    },
  })

  const script = await service.saveScript(
    {
      projectId: 7,
      sessionId: 3,
      sessionChatId: 11,
    },
    { id: 1 },
  )

  assert.equal(createdScripts.length, 1)
  assert.equal(createdScripts[0].projectId, 7)
  assert.equal(createdScripts[0].sessionId, 3)
  assert.equal(createdScripts[0].sourceMessageId, 11)
  assert.equal(createdScripts[0].source, 'ai')
  assert.equal(createdScripts[0].content, '# 春晓讲解\n\n这里是剧本正文。')
  assert.equal(script.scriptId, 5)
  assert.equal(script.source, 'ai')
})

test('ScriptService copies prompt config from the source message request log', async () => {
  const createdScripts = []
  const service = new ScriptService({
    project: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 7 })
        return { id: 7 }
      },
    },
    sessionMessage: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 11, sessionId: 3, role: 'assistant' })
        return {
          id: 11,
          sessionId: 3,
          promptRequestLogId: 22,
          content: '# 哪吒脑海\n\n这里是剧本正文。',
        }
      },
    },
    generationTask: {
      findUnique: async query => {
        assert.deepEqual(query.where, { id: 22 })
        return {
          id: 22,
          request: JSON.stringify({
            scriptType: '剧情',
            scriptStyle: '故事型',
            duration: 120,
            shotNum: 14,
            characters: '哪吒',
            scriptContent: '哪吒脑海',
          }),
        }
      },
    },
    script: {
      create: async query => {
        createdScripts.push(query.data)
        return {
          id: 7,
          ...query.data,
          createdAt: new Date('2026-07-16T08:00:00.000Z'),
          updatedAt: new Date('2026-07-16T08:00:00.000Z'),
        }
      },
    },
  })

  const script = await service.saveScript({
    projectId: 7,
    sessionId: 3,
    sessionChatId: 11,
  })

  assert.equal(createdScripts.length, 1)
  assert.equal(createdScripts[0].scriptType, '剧情')
  assert.equal(createdScripts[0].scriptStyle, '故事型')
  assert.equal(createdScripts[0].duration, 120)
  assert.equal(createdScripts[0].shotNum, 14)
  assert.equal(createdScripts[0].characters, '哪吒')
  assert.equal(script.scriptType, '剧情')
})

test('ScriptService falls back to provided text when chat message id is temporary', async () => {
  const createdScripts = []
  const service = new ScriptService({
    project: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 7 })
        return { id: 7 }
      },
    },
    sessionMessage: {
      findFirst: async () => {
        throw new Error('sessionMessage should not be queried for a temporary id')
      },
    },
    script: {
      create: async query => {
        createdScripts.push(query.data)
        return {
          id: 6,
          ...query.data,
          createdAt: new Date('2026-07-16T08:00:00.000Z'),
          updatedAt: new Date('2026-07-16T08:00:00.000Z'),
        }
      },
    },
  })

  const script = await service.saveScript({
    projectId: 7,
    sessionId: 3,
    sessionChatId: 'streaming-3',
    scriptText: '# 临时剧本\n\n这是前端当前气泡正文。',
  })

  assert.equal(createdScripts.length, 1)
  assert.equal(createdScripts[0].sourceMessageId, undefined)
  assert.equal(createdScripts[0].content, '# 临时剧本\n\n这是前端当前气泡正文。')
  assert.equal(script.scriptId, 6)
})

test('ScriptService confirms a script and initializes editable shots', async () => {
  const operations = []
  const service = new ScriptService({
    script: {
      findFirst: async query => {
        assert.deepEqual(query.where, { id: 12, projectId: 7 })
        return {
          id: 12,
          projectId: 7,
          title: '哪吒脑海',
          content: '# 哪吒脑海\n\n第一段：哪吒看见混沌的记忆。\n\n第二段：他听见风火轮的声音。\n\n第三段：他冲出迷雾。',
          shotNum: 2,
          confirmed: false,
        }
      },
    },
    $transaction: async callback => {
      const tx = {
        script: {
          updateMany: async query => operations.push(['script.updateMany', query]),
          update: async query => {
            operations.push(['script.update', query])
            return {
              id: 12,
              projectId: 7,
              title: '哪吒脑海',
              content: '# 哪吒脑海\n\n第一段：哪吒看见混沌的记忆。\n\n第二段：他听见风火轮的声音。\n\n第三段：他冲出迷雾。',
              shotNum: 2,
              confirmed: true,
              createdAt: new Date('2026-07-16T08:00:00.000Z'),
              updatedAt: new Date('2026-07-16T08:00:00.000Z'),
            }
          },
        },
        shot: {
          deleteMany: async query => operations.push(['shot.deleteMany', query]),
          create: async query => {
            operations.push(['shot.create', query])
            return query.data
          },
        },
        project: {
          update: async query => operations.push(['project.update', query]),
        },
      }
      return callback(tx)
    },
  })

  const result = await service.confirmScript({ projectId: 7, scriptId: 12 })

  assert.equal(result.scriptId, 12)
  assert.equal(result.shotCount, 2)
  assert.deepEqual(operations[0], ['script.updateMany', { where: { projectId: 7 }, data: { confirmed: false } }])
  assert.deepEqual(operations[2], ['shot.deleteMany', { where: { projectId: 7 } }])
  assert.deepEqual(operations[3], [
    'shot.create',
    {
      data: {
        projectId: 7,
        title: '镜头1',
        content: '哪吒脑海\n\n第一段：哪吒看见混沌的记忆。',
        duration: undefined,
        camera: '',
        scene: '',
        characters: '',
        visualPrompt: '哪吒脑海\n\n第一段：哪吒看见混沌的记忆。',
        videoPrompt: '',
        narration: '',
        soundEffects: '',
        backgroundMusic: '',
        soundEffectResourceIds: '',
        status: 'uncompleted',
        imageStatus: 'uncompleted',
        videoStatus: 'uncompleted',
        voiceStatus: 'uncompleted',
        sortOrder: 0,
      },
    },
  ])
  assert.deepEqual(operations[4], [
    'shot.create',
    {
      data: {
        projectId: 7,
        title: '镜头2',
        content: '第二段：他听见风火轮的声音。\n\n第三段：他冲出迷雾。',
        duration: undefined,
        camera: '',
        scene: '',
        characters: '',
        visualPrompt: '第二段：他听见风火轮的声音。\n\n第三段：他冲出迷雾。',
        videoPrompt: '',
        narration: '',
        soundEffects: '',
        backgroundMusic: '',
        soundEffectResourceIds: '',
        status: 'uncompleted',
        imageStatus: 'uncompleted',
        videoStatus: 'uncompleted',
        voiceStatus: 'uncompleted',
        sortOrder: 1,
      },
    },
  ])
  assert.deepEqual(operations[5], [
    'project.update',
    {
      where: { id: 7 },
      data: { state: 'ScriptConfirmed', shotNum: 2 },
    },
  ])
})

test('ScriptService uses LLM structured shots for image generation fields', async () => {
  const operations = []
  const llmRequests = []
  const service = new ScriptService(
    {
      script: {
        findFirst: async () => ({
          id: 13,
          projectId: 7,
          title: '哪吒脑海',
          content: '哪吒站在海边，巨浪升起。',
          shotNum: 1,
          confirmed: false,
        }),
        updateMany: async () => {},
      },
      generationTask: {
        create: async query => {
          operations.push(['generationTask.create', query])
          return { id: 31, ...query.data }
        },
        update: async query => {
          operations.push(['generationTask.update', query])
          return query.data
        },
      },
      $transaction: async callback => {
        const tx = {
          script: {
            updateMany: async query => operations.push(['script.updateMany', query]),
            update: async query => ({
              id: 13,
              projectId: 7,
              title: '哪吒脑海',
              content: '哪吒站在海边，巨浪升起。',
              confirmed: true,
              createdAt: new Date('2026-07-16T08:00:00.000Z'),
              updatedAt: new Date('2026-07-16T08:00:00.000Z'),
            }),
          },
          shot: {
            deleteMany: async query => operations.push(['shot.deleteMany', query]),
            create: async query => {
              operations.push(['shot.create', query])
              return query.data
            },
          },
          project: {
            update: async query => operations.push(['project.update', query]),
          },
        }
        return callback(tx)
      },
    },
    {
      completeChat: async messages => {
        llmRequests.push(messages)
        return JSON.stringify({
          shots: [
            {
              title: '镜头1：海边巨浪',
              content: '哪吒站在海边，巨浪从身后升起。',
              duration: 5,
              camera: '全景',
              scene: '陈塘关海边',
              characters: '哪吒',
              visualPrompt: 'Chinese myth animation, Nezha standing by the sea, huge wave rising, cinematic wide shot',
              videoPrompt: 'Camera slowly pushes toward Nezha as the wave rises behind him.',
              narration: '海风骤起，哪吒望向翻涌的大海。',
            },
          ],
        })
      },
    },
  )

  const result = await service.confirmScript({ projectId: 7, scriptId: 13 })
  const shotCreate = operations.find(item => item[0] === 'shot.create')

  assert.equal(result.shotCount, 1)
  assert.ok(llmRequests[0][0].content.includes('专业影视分镜设计师'))
  assert.deepEqual(shotCreate[1].data, {
    projectId: 7,
    title: '镜头1：海边巨浪',
    content: '哪吒站在海边，巨浪从身后升起。',
    duration: 5,
    camera: '全景',
    scene: '陈塘关海边',
    characters: '哪吒',
    visualPrompt: 'Chinese myth animation, Nezha standing by the sea, huge wave rising, cinematic wide shot',
    videoPrompt: 'Camera slowly pushes toward Nezha as the wave rises behind him.',
    narration: '海风骤起，哪吒望向翻涌的大海。',
    soundEffects: '',
    backgroundMusic: '',
    soundEffectResourceIds: '',
    status: 'uncompleted',
    imageStatus: 'uncompleted',
    videoStatus: 'uncompleted',
    voiceStatus: 'uncompleted',
    sortOrder: 0,
  })
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
