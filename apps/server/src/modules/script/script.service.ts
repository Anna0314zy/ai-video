import { Inject, Injectable, Optional } from '@nestjs/common'
import crypto from 'node:crypto'
import { PrismaService } from '../../prisma/prisma.service.js'
import { AppException } from '../../common/app-exception.js'
import type { LlmMessage } from '../../llm/llm-provider.js'
import { LlmService } from '../../llm/llm.service.js'

interface CurrentUser {
  id: number
}

type ScriptTemplateExt = 'md' | 'csv' | 'tsv'

const SCRIPT_FIELD_LABELS = [
  ['剧本标题', 'title'],
  ['剧本正文', 'content'],
  ['剧本类型', 'scriptType'],
  ['剧本风格', 'scriptStyle'],
  ['预计总时长（秒）', 'duration'],
  ['期望镜头数量', 'shotNum'],
  ['主要角色', 'characters'],
  ['场景设定', 'sceneSetting'],
  ['旁白要求', 'narrationRequirement'],
  ['画面风格', 'visualStyle'],
  ['禁用内容', 'negativePrompt'],
  ['备注', 'remark'],
] as const

const SCRIPT_LABEL_TO_FIELD = new Map(SCRIPT_FIELD_LABELS.map(([label, key]) => [label, key]))

@Injectable()
export class ScriptService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Optional() @Inject(LlmService) private readonly llmService?: Pick<LlmService, 'completeChat'>,
  ) {}

  async createSession(projectId: number, user?: CurrentUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: Number(projectId),
        ...(user?.id ? { ownerId: user.id } : {}),
      },
    })
    if (!project) throw new AppException('not-found')

    const session = await this.prisma.session.create({
      data: {
        projectId: project.id,
      },
    })
    return session.id
  }

  async listSessions(params: { projectId: number }) {
    const projectId = Number(params.projectId)
    if (!Number.isFinite(projectId) || projectId <= 0) throw new AppException('validation')

    const sessions = await (this.prisma.session as any).findMany({
      where: { projectId },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }, { id: 'desc' }],
      include: {
        _count: {
          select: { messages: true },
        },
      },
    })

    return sessions.map(mapSession)
  }

  async touchSessionAfterMessage(sessionId: number, userMessageContent?: string) {
    const id = Number(sessionId)
    if (!Number.isFinite(id) || id <= 0) throw new AppException('validation')

    const session = await (this.prisma.session as any).findUnique({
      where: { id },
    })
    if (!session) throw new AppException('not-found')

    const title = shouldReplaceSessionTitle(session.title) ? buildSessionTitle(userMessageContent) : session.title

    await (this.prisma.session as any).update({
      where: { id },
      data: {
        title,
        lastMessageAt: new Date(),
      },
    })
  }

  async histories(params: { sessionId: number; current?: number; size?: number; beforeCreated?: number | string; beforeId?: number }) {
    const current = params.current || 1
    const size = params.size || 10
    const sessionId = Number(params.sessionId)
    if (!Number.isFinite(sessionId) || sessionId <= 0) throw new AppException('validation')

    const cursor = parseBeforeCursor(params.beforeCreated, params.beforeId)
    const where = cursor
      ? {
          sessionId,
          OR: [
            { createdAt: { lt: cursor.createdAt } },
            {
              createdAt: cursor.createdAt,
              id: { lt: cursor.id },
            },
          ],
        }
      : { sessionId }
    const total = await this.prisma.sessionMessage.count({ where })
    const records = cursor
      ? await this.prisma.sessionMessage.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: size,
        })
      : await this.prisma.sessionMessage.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (current - 1) * size,
        take: size,
      })
    const sortedRecords = [...records].sort((a, b) => {
      const createdDiff = a.createdAt.getTime() - b.createdAt.getTime()
      return createdDiff || a.id - b.id
    })

    return {
      records: sortedRecords.map(mapSessionMessage),
      current,
      size,
      total,
    }
  }

  async saveScript(params: any, user?: CurrentUser) {
    const projectId = Number(params.projectId)
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ...(user?.id ? { ownerId: user.id } : {}),
      },
    })
    if (!project) throw new AppException('not-found')

    const sessionId = toOptionalNumber(params.sessionId)
    let sourceMessageId = toOptionalNumber(params.sessionChatId)
    let source = normalizeScriptSource(params.source)
    let title = normalizeNonEmptyString(params.scriptName || params.title) || '未命名剧本'
    let content = normalizeNonEmptyString(params.scriptText || params.content) || ''
    let promptConfig: Record<string, unknown> = {}

    if (sourceMessageId) {
      const message = await this.prisma.sessionMessage.findFirst({
        where: {
          id: sourceMessageId,
          ...(sessionId ? { sessionId } : {}),
          role: 'assistant',
        },
      })
      if (message) {
        source = 'ai'
        content = message.content
        title = normalizeNonEmptyString(params.scriptName || params.title) || deriveScriptTitle(message.content)
        promptConfig = await this.getPromptRequestConfig(message.promptRequestLogId)
      } else if (content) {
        sourceMessageId = undefined
      } else {
        throw new AppException('not-found', '未找到可标记为剧本的助手消息')
      }
    }

    if (!content) throw new AppException('validation', '剧本正文不能为空')

    const script = await this.prisma.script.create({
      data: {
        projectId: project.id,
        sessionId,
        sourceMessageId,
        title,
        content,
        source,
        ...pickScriptCreateFields({
          ...promptConfig,
          ...params,
        }),
      },
    })
    return mapScript(script)
  }

  private async getPromptRequestConfig(promptRequestLogId?: number | null) {
    const id = toOptionalNumber(promptRequestLogId)
    if (!id) return {}

    const task = await this.prisma.generationTask.findUnique({
      where: { id },
    })
    return parseJsonObject(task?.request)
  }

  async createShotPromptLog(body: any) {
    const prompt = buildEditableScriptPrompt(body)
    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `shot-prompt-${crypto.randomUUID()}`,
        provider: 'internal',
        type: 'shot-prompt-parse',
        state: 'SUCCESS',
        request: JSON.stringify(body || {}),
        result: JSON.stringify({ prompt }),
      },
    })

    return {
      prompt,
      promptRequestLogId: task.id,
      taskId: task.taskId,
    }
  }

  async buildResendMessages(params: { sessionId?: number; sessionChatId?: number | string }): Promise<LlmMessage[]> {
    const sessionId = Number(params.sessionId)
    const targetId = Number(params.sessionChatId)
    if (!Number.isFinite(sessionId) || sessionId <= 0 || !Number.isFinite(targetId) || targetId <= 0) {
      throw new AppException('validation')
    }

    const target = await this.prisma.sessionMessage.findFirst({
      where: {
        id: targetId,
        sessionId,
      },
    })
    if (!target) throw new AppException('not-found')

    const context = await this.prisma.sessionMessage.findMany({
      where: {
        sessionId,
        OR: [
          { createdAt: { lt: target.createdAt } },
          {
            createdAt: target.createdAt,
            id: { lt: target.id },
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 20,
    })

    return [
      ...context.reverse().map(message => ({
        role: normalizeMessageRole(message.role),
        content: message.content,
      })),
      {
        role: 'user',
        content:
          '请基于以上对话上下文，重新生成上一条助手回复。只输出新的剧本内容，不要解释，不要提到无法看到上下文，不要输出“重新生成”说明。',
      },
    ]
  }

  async pageScript(params: { current?: number; size?: number; projectId?: number }) {
    const current = params.current || 1
    const size = params.size || 10
    const where = params.projectId ? { projectId: Number(params.projectId) } : undefined
    const [total, records] = await this.prisma.$transaction([
      this.prisma.script.count({ where }),
      this.prisma.script.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (current - 1) * size,
        take: size,
      }),
    ])

    return {
      current,
      size,
      total,
      records: records.map(mapScript),
    }
  }

  async previewScript(scriptId: number) {
    const script = await this.prisma.script.findUnique({ where: { id: Number(scriptId) } })
    if (!script) throw new AppException('not-found')
    return mapScript(script)
  }

  async importScript(projectId: number, fileName: string, rawContent: string | Buffer, user?: CurrentUser) {
    const id = Number(projectId)
    if (!Number.isFinite(id) || id <= 0) throw new AppException('validation')

    const project = await this.prisma.project.findFirst({
      where: {
        id,
        ...(user?.id ? { ownerId: user.id } : {}),
      },
    })
    if (!project) throw new AppException('not-found')

    const parsed = parseImportedScript(rawContent, fileName)
    const script = await this.prisma.script.create({
      data: {
        projectId: project.id,
        title: parsed.title,
        content: parsed.content,
        source: 'import',
        ...pickScriptCreateFields(parsed),
      },
    })

    return mapScript(script)
  }

  async deleteScripts(scriptIdList: number[]) {
    const ids = scriptIdList.map(Number).filter(id => Number.isFinite(id) && id > 0)
    await this.prisma.script.deleteMany({ where: { id: { in: ids } } })
    return { scriptIdList: ids }
  }

  async confirmScript(params: { projectId: number; scriptId: number }) {
    const projectId = Number(params.projectId)
    const scriptId = Number(params.scriptId)
    console.info('[ScriptService.confirmScript] start', { projectId, scriptId })
    const script = await this.prisma.script.findFirst({ where: { id: scriptId, projectId } })
    if (!script) throw new AppException('not-found')
    const shotDrafts = await this.buildShotDraftsWithModel(script)
    console.info('[ScriptService.confirmScript] script loaded', {
      projectId,
      scriptId,
      title: script.title,
      contentLength: script.content?.length || 0,
      requestedShotNum: script.shotNum,
      shotDraftCount: shotDrafts.length,
    })

    const result = await this.prisma
      .$transaction(async tx => {
        await tx.script.updateMany({
          where: { projectId },
          data: { confirmed: false },
        })
        const confirmedScript = await tx.script.update({
          where: { id: scriptId },
          data: { confirmed: true },
        })
        await tx.shot.deleteMany({ where: { projectId } })
        for (const [index, shot] of shotDrafts.entries()) {
          await tx.shot.create({
            data: {
              projectId,
              title: shot.title,
              content: shot.content,
              duration: shot.duration,
              camera: shot.camera,
              scene: shot.scene,
              characters: shot.characters,
              visualPrompt: shot.visualPrompt,
              videoPrompt: shot.videoPrompt,
              narration: shot.narration,
              status: shot.status,
              imageStatus: shot.imageStatus,
              videoStatus: shot.videoStatus,
              voiceStatus: shot.voiceStatus,
              sortOrder: index,
            },
          })
        }
        await tx.project.update({
          where: { id: projectId },
          data: { state: 'ScriptConfirmed', shotNum: shotDrafts.length },
        })
        return { script: confirmedScript, shotCount: shotDrafts.length }
      })
      .catch(error => {
        console.error('[ScriptService.confirmScript] transaction failed', {
          projectId,
          scriptId,
          shotDraftCount: shotDrafts.length,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        throw error
      })
    console.info('[ScriptService.confirmScript] success', { projectId, scriptId, shotCount: result.shotCount })

    return {
      ...mapScript(result.script),
      shotCount: result.shotCount,
    }
  }

  private async buildShotDraftsWithModel(script: any) {
    if (!this.llmService?.completeChat) return buildShotDrafts(script)
    const task = await this.prisma.generationTask.create({
      data: {
        taskId: `shot-split-${crypto.randomUUID()}`,
        provider: 'llm',
        type: 'shot-split',
        state: 'RUNNING',
        request: JSON.stringify({
          scriptId: script.id,
          projectId: script.projectId,
          title: script.title,
          shotNum: script.shotNum,
        }),
      },
    })
    try {
      const raw = await this.llmService.completeChat(buildShotSplitMessages(script), { temperature: 0.2 })
      const shots = parseStructuredShots(raw, script)
      await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: 'SUCCESS',
          result: JSON.stringify({ raw, shots }),
        },
      })
      return shots
    } catch (error) {
      console.error('[ScriptService.confirmScript] LLM shot split failed, fallback to rule split', {
        scriptId: script.id,
        message: error instanceof Error ? error.message : String(error),
      })
      await this.prisma.generationTask.update({
        where: { id: task.id },
        data: {
          state: 'FAILED',
          result: JSON.stringify({
            message: error instanceof Error ? error.message : String(error),
          }),
        },
      })
      return buildShotDrafts(script)
    }
  }
}

export function buildScriptTemplate(ext: string = 'md') {
  const normalizedExt = normalizeTemplateExt(ext)
  if (normalizedExt === 'md') {
    const content = [
      '# 剧本标题',
      '春晓古诗讲解剧本',
      '',
      '# 剧本正文',
      '第一段：以清晨鸟鸣引入古诗《春晓》，带学生感受春天早晨的画面。',
      '',
      '# 剧本信息',
      '- 剧本类型：讲解',
      '- 剧本风格：故事型',
      '- 预计总时长（秒）：60',
      '- 期望镜头数量：6',
      '- 主要角色：老师、学生',
      '- 场景设定：春天清晨的教室与窗外花园',
      '- 旁白要求：语言亲切，适合课堂导入',
      '- 画面风格：明亮、温暖、儿童友好',
      '- 禁用内容：暴力、恐怖、低俗内容',
      '- 备注：可根据课堂节奏调整镜头数量',
      '',
    ].join('\n')
    return {
      fileName: '剧本模板.md',
      contentType: 'text/markdown; charset=utf-8',
      content,
    }
  }

  const separator = normalizedExt === 'tsv' ? '\t' : ','
  const headers = SCRIPT_FIELD_LABELS.map(([label]) => label)
  const row = [
    '春晓古诗讲解剧本',
    '第一段：以清晨鸟鸣引入古诗《春晓》，带学生感受春天早晨的画面。',
    '讲解',
    '故事型',
    '60',
    '6',
    '老师、学生',
    '春天清晨的教室与窗外花园',
    '语言亲切，适合课堂导入',
    '明亮、温暖、儿童友好',
    '暴力、恐怖、低俗内容',
    '可根据课堂节奏调整镜头数量',
  ]

  return {
    fileName: `剧本模板.${normalizedExt}`,
    contentType: normalizedExt === 'tsv' ? 'text/tab-separated-values; charset=utf-8' : 'text/csv; charset=utf-8',
    content: [headers, row].map(values => values.map(escapeDelimitedCell).join(separator)).join('\n'),
  }
}

export function parseImportedScript(rawContent: string | Buffer, fileName = '剧本.md') {
  const text = Buffer.isBuffer(rawContent) ? rawContent.toString('utf8') : String(rawContent || '')
  const ext = normalizeTemplateExt(fileName.split('.').pop() || 'md')
  const parsed = ext === 'md' ? parseMarkdownScript(text) : parseDelimitedScript(text, ext === 'tsv' ? '\t' : ',')
  const title = normalizeNonEmptyString(parsed.title)
  const content = normalizeNonEmptyString(parsed.content)
  if (!title || !content) throw new AppException('validation', '导入剧本必须包含剧本标题和剧本正文')
  return {
    ...parsed,
    title,
    content,
    duration: toOptionalNumber(parsed.duration),
    shotNum: toOptionalNumber(parsed.shotNum),
  }
}

function parseBeforeCursor(beforeCreated?: number | string, beforeId?: number) {
  if (!beforeCreated || !beforeId) return null
  const createdAt = typeof beforeCreated === 'number' ? new Date(beforeCreated) : new Date(beforeCreated)
  const id = Number(beforeId)
  if (Number.isNaN(createdAt.getTime()) || !Number.isFinite(id) || id <= 0) return null
  return { createdAt, id }
}

function mapSessionMessage(message: any) {
  return {
    ...message,
    messageContent: message.content,
    promptRequestLogId: message.promptRequestLogId,
    created: message.createdAt?.getTime?.() || message.created,
  }
}

function mapSession(session: any) {
  return {
    id: session.id,
    projectId: session.projectId,
    title: session.title || '新会话',
    lastMessageAt: session.lastMessageAt?.toISOString?.() || null,
    createdAt: session.createdAt?.toISOString?.() || session.createdAt,
    updatedAt: session.updatedAt?.toISOString?.() || session.updatedAt,
    messageCount: session._count?.messages || 0,
  }
}

function mapScript(script: any) {
  const modified = script.updatedAt?.toISOString?.() || script.createdAt?.toISOString?.() || script.modified
  return {
    ...script,
    scriptId: script.id,
    scriptName: script.title,
    scriptText: script.content,
    name: script.title,
    modified,
    isFinal: script.confirmed ? 1 : 0,
    scriptContent: script.content,
    created: script.createdAt?.toISOString?.() || script.created,
  }
}

function normalizeMessageRole(role: string): LlmMessage['role'] {
  if (role === 'assistant' || role === 'system' || role === 'user') return role
  if (role === 'gpt') return 'assistant'
  return 'user'
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function normalizeTemplateExt(ext?: string): ScriptTemplateExt {
  const normalized = String(ext || 'md').toLowerCase()
  if (normalized === 'csv' || normalized === 'tsv' || normalized === 'md') return normalized
  return 'md'
}

function normalizeScriptSource(value: unknown) {
  const source = String(value || 'manual')
  if (source === 'ai' || source === 'import' || source === 'manual') return source
  return 'manual'
}

function normalizeNonEmptyString(value: unknown) {
  const text = String(value ?? '').trim()
  return text || undefined
}

function deriveScriptTitle(content: string) {
  const firstLine = String(content || '')
    .split(/\r?\n/)
    .map(line => line.replace(/^#+\s*/, '').trim())
    .find(Boolean)
  return (firstLine || '未命名剧本').slice(0, 40)
}

function pickScriptCreateFields(source: any) {
  return {
    scriptType: normalizeNonEmptyString(source.scriptType),
    scriptStyle: normalizeNonEmptyString(source.scriptStyle),
    duration: toOptionalNumber(source.duration),
    shotNum: toOptionalNumber(source.shotNum),
    characters: normalizeNonEmptyString(source.characters),
    sceneSetting: normalizeNonEmptyString(source.sceneSetting),
    narrationRequirement: normalizeNonEmptyString(source.narrationRequirement),
    visualStyle: normalizeNonEmptyString(source.visualStyle),
    negativePrompt: normalizeNonEmptyString(source.negativePrompt),
    remark: normalizeNonEmptyString(source.remark),
  }
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {}
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  if (typeof value !== 'string') return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function parseJsonValue(value: unknown): any {
  if (!value) return {}
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function buildEditableScriptPrompt(source: any) {
  const scriptType = normalizeNonEmptyString(source.scriptType)
  const scriptStyle = normalizeNonEmptyString(source.scriptStyle)
  const scriptContent = normalizeNonEmptyString(source.scriptContent || source.content || source.text)
  const characters = normalizeNonEmptyString(source.characters)
  const duration = toOptionalNumber(source.duration)
  const shotNum = toOptionalNumber(source.shotNum)
  const wordNum = toOptionalNumber(source.wordNum)

  const opening =
    scriptType && scriptStyle
      ? `请生成一个${scriptType}类型、${scriptStyle}风格的剧本。`
      : scriptType
        ? `请生成一个${scriptType}类型的剧本。`
        : scriptStyle
          ? `请生成一个${scriptStyle}风格的剧本。`
          : '请生成一个适合后续镜头设计的剧本。'

  const details = [
    scriptContent ? `主题：${scriptContent}` : undefined,
    characters ? `主角：${characters}` : undefined,
    duration ? `总时长：${duration} 秒` : undefined,
    shotNum ? `镜头数量：${shotNum} 个` : undefined,
    wordNum ? `目标字数：${wordNum} 字` : undefined,
  ].filter(Boolean)

  const requirements = [
    '要求：',
    '1. 剧本适合后续拆分为镜头设计。',
    '2. 输出结构清晰，包含标题、正文和必要的场景描述。',
    scriptStyle ? `3. 语言风格符合${scriptStyle}表达。` : '3. 语言表达自然，画面感明确。',
  ]

  return [opening, details.length ? details.join('\n') : '', requirements.join('\n')].filter(Boolean).join('\n\n')
}

function buildShotDrafts(script: any) {
  const targetCount = toOptionalNumber(script.shotNum)
  const parts = splitScriptIntoShotParts(script.content)
  const count = targetCount || parts.length || 1
  const safeCount = Math.max(1, Math.min(count, 60))
  const groups = groupParts(parts.length ? parts : [normalizeNonEmptyString(script.content) || script.title || ''], safeCount)

  return groups.map((group, index) => ({
    title: `镜头${index + 1}`,
    content: group.join('\n\n').trim() || `${script.title || '剧本'} - 镜头${index + 1}`,
    duration: undefined,
    camera: '',
    scene: '',
    characters: normalizeNonEmptyString(script.characters) || '',
    visualPrompt: group.join('\n\n').trim() || `${script.title || '剧本'} - 镜头${index + 1}`,
    videoPrompt: '',
    narration: '',
    status: 'uncompleted',
    imageStatus: 'uncompleted',
    videoStatus: 'uncompleted',
    voiceStatus: 'uncompleted',
  }))
}

function buildShotSplitMessages(script: any): LlmMessage[] {
  const shotNum = toOptionalNumber(script.shotNum)
  return [
    {
      role: 'system',
      content:
        '你是专业影视分镜设计师。请把剧本拆成适合图片、视频、旁白生成的镜头结构。只输出合法 JSON，不要输出 Markdown，不要解释。',
    },
    {
      role: 'user',
      content: [
        `剧本标题：${script.title || '未命名剧本'}`,
        shotNum ? `期望镜头数量：${shotNum}` : '期望镜头数量：请按剧情自然拆分',
        '',
        '输出 JSON 格式：',
        '{"shots":[{"title":"镜头标题","content":"镜头内容/动作描述","duration":5,"camera":"景别/镜头语言","scene":"场景","characters":"角色","visualPrompt":"给图片生成模型的英文或中英混合画面提示词","videoPrompt":"给视频生成模型的运动提示词","narration":"旁白文本"}]}',
        '',
        '要求：',
        '1. visualPrompt 必须能直接作为图片生成模型入参，包含主体、场景、风格、构图、光线。',
        '2. content 面向用户编辑，中文描述清楚镜头动作和画面。',
        '3. narration 可为空，但不要编造与剧本无关的信息。',
        '4. 不要把标题、总时长、分隔线、终幕说明单独拆成镜头。',
        '5. 如果剧本已有编号镜头，优先按编号镜头解析。',
        '',
        '剧本正文：',
        script.content || '',
      ].join('\n'),
    },
  ]
}

function parseStructuredShots(raw: string, script: any) {
  const parsed = parseJsonValue(extractJsonText(raw))
  const sourceShots = Array.isArray(parsed.shots) ? parsed.shots : Array.isArray(parsed) ? parsed : []
  const shots = sourceShots
    .map((item: any, index: number) => normalizeStructuredShot(item, index, script))
    .filter((shot: any) => shot.content || shot.visualPrompt)
  if (!shots.length) throw new Error('LLM shot split returned empty shots')
  return shots.slice(0, 80)
}

function normalizeStructuredShot(item: any, index: number, script: any) {
  const content = normalizeNonEmptyString(item?.content || item?.shotContent || item?.description) || ''
  const visualPrompt =
    normalizeNonEmptyString(item?.visualPrompt || item?.imagePrompt || item?.midjourneyPrompt) ||
    content ||
    normalizeNonEmptyString(script.title) ||
    ''
  return {
    title: normalizeNonEmptyString(item?.title || item?.shotName) || `镜头${index + 1}`,
    content,
    duration: toOptionalNumber(item?.duration),
    camera: normalizeNonEmptyString(item?.camera || item?.cameraLanguage || item?.shotType) || '',
    scene: normalizeNonEmptyString(item?.scene) || '',
    characters: normalizeNonEmptyString(item?.characters) || normalizeNonEmptyString(script.characters) || '',
    visualPrompt,
    videoPrompt: normalizeNonEmptyString(item?.videoPrompt || item?.motionPrompt) || '',
    narration: normalizeNonEmptyString(item?.narration || item?.voiceover) || '',
    status: 'uncompleted',
    imageStatus: 'uncompleted',
    videoStatus: 'uncompleted',
    voiceStatus: 'uncompleted',
  }
}

function extractJsonText(raw: string) {
  const text = String(raw || '').trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() || text
  const startObject = candidate.indexOf('{')
  const startArray = candidate.indexOf('[')
  const starts = [startObject, startArray].filter(index => index >= 0)
  if (!starts.length) return candidate
  const start = Math.min(...starts)
  const endObject = candidate.lastIndexOf('}')
  const endArray = candidate.lastIndexOf(']')
  const end = Math.max(endObject, endArray)
  return end >= start ? candidate.slice(start, end + 1) : candidate
}

function splitScriptIntoShotParts(content: string) {
  return String(content || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(part => part.replace(/^#{1,6}\s*/, '').trim())
    .filter(Boolean)
}

function groupParts(parts: string[], targetCount: number) {
  if (parts.length === targetCount) return parts.map(part => [part])
  if (parts.length > targetCount) {
    return Array.from({ length: targetCount }, (_, index) => {
      const start = Math.floor((index * parts.length) / targetCount)
      const end = Math.floor(((index + 1) * parts.length) / targetCount)
      return parts.slice(start, Math.max(start + 1, end))
    })
  }

  const groups = parts.map(part => [part])
  while (groups.length < targetCount) groups.push([''])
  return groups
}

function parseMarkdownScript(text: string) {
  const result: Record<string, any> = {}
  const sections = parseMarkdownSections(text)
  result.title = sections['剧本标题'] || extractMarkdownMetaValue(text, '剧本标题')
  result.content = sections['剧本正文'] || extractMarkdownMetaValue(text, '剧本正文')

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*[-*]?\s*([^：:]+)\s*[：:]\s*(.*?)\s*$/)
    if (!match) continue
    const field = SCRIPT_LABEL_TO_FIELD.get(match[1].trim() as any)
    if (field) result[field] = match[2].trim()
  }

  return result
}

function parseMarkdownSections(text: string) {
  const sections: Record<string, string> = {}
  let currentTitle = ''
  let buffer: string[] = []
  const flush = () => {
    if (currentTitle) sections[currentTitle] = buffer.join('\n').trim()
  }

  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/)
    if (heading) {
      flush()
      currentTitle = heading[1].trim()
      buffer = []
    } else if (currentTitle) {
      buffer.push(line)
    }
  }
  flush()
  return sections
}

function extractMarkdownMetaValue(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = text.match(new RegExp(`${escaped}\\s*[：:]\\s*(.+)`))
  return match?.[1]?.trim()
}

function parseDelimitedScript(text: string, separator: ',' | '\t') {
  const rows = parseDelimitedRows(text, separator).filter(row => row.some(cell => cell.trim()))
  if (rows.length < 2) return {}
  const headers = rows[0].map(cell => cell.trim())
  const values = rows[1]
  const result: Record<string, any> = {}
  headers.forEach((header, index) => {
    const field = SCRIPT_LABEL_TO_FIELD.get(header as any)
    if (field) result[field] = values[index]?.trim()
  })
  return result
}

function parseDelimitedRows(text: string, separator: ',' | '\t') {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && char === separator) {
      row.push(cell)
      cell = ''
      continue
    }

    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)
  return rows
}

function escapeDelimitedCell(value: string) {
  if (!/[",\n\r\t]/.test(value)) return value
  return `"${value.replace(/"/g, '""')}"`
}

export function buildSessionTitle(content?: string) {
  const normalized = String(content || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return '新会话'
  return normalized.slice(0, 20)
}

export function shouldReplaceSessionTitle(title?: string | null) {
  return !title || title === '新会话'
}
