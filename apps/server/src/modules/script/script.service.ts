import { Inject, Injectable } from '@nestjs/common'
import crypto from 'node:crypto'
import { PrismaService } from '../../prisma/prisma.service.js'
import { AppException } from '../../common/app-exception.js'

interface CurrentUser {
  id: number
}

@Injectable()
export class ScriptService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async histories(params: { sessionId: number; current?: number; size?: number }) {
    const current = params.current || 1
    const size = params.size || 10
    const sessionId = Number(params.sessionId)
    if (!Number.isFinite(sessionId) || sessionId <= 0) throw new AppException('validation')

    const where = { sessionId }
    const [total, records] = await this.prisma.$transaction([
      this.prisma.sessionMessage.count({ where }),
      this.prisma.sessionMessage.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (current - 1) * size,
        take: size,
      }),
    ])

    return {
      records: records.map(mapSessionMessage),
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

    const script = await this.prisma.script.create({
      data: {
        projectId: project.id,
        sessionId: toOptionalNumber(params.sessionId),
        title: params.scriptName || params.title || '未命名剧本',
        content: params.scriptText || params.content || '',
      },
    })
    return mapScript(script)
  }

  async createShotPromptLog(body: any) {
    const prompt = JSON.stringify(body)
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

  async deleteScripts(scriptIdList: number[]) {
    const ids = scriptIdList.map(Number).filter(id => Number.isFinite(id) && id > 0)
    await this.prisma.script.deleteMany({ where: { id: { in: ids } } })
    return { scriptIdList: ids }
  }

  async confirmScript(params: { projectId: number; scriptId: number }) {
    const projectId = Number(params.projectId)
    const scriptId = Number(params.scriptId)
    const script = await this.prisma.script.findFirst({ where: { id: scriptId, projectId } })
    if (!script) throw new AppException('not-found')

    const updated = await this.prisma.$transaction(async tx => {
      await tx.script.updateMany({
        where: { projectId },
        data: { confirmed: false },
      })
      const confirmedScript = await tx.script.update({
        where: { id: scriptId },
        data: { confirmed: true },
      })
      await tx.project.update({
        where: { id: projectId },
        data: { state: 'ScriptConfirmed' },
      })
      return confirmedScript
    })

    return mapScript(updated)
  }
}

function mapSessionMessage(message: any) {
  return {
    ...message,
    messageContent: message.content,
    created: message.createdAt?.getTime?.() || message.created,
  }
}

function mapScript(script: any) {
  return {
    ...script,
    scriptId: script.id,
    scriptName: script.title,
    scriptText: script.content,
    created: script.createdAt?.toISOString?.() || script.created,
  }
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}
