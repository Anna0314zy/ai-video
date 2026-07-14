import { Inject, Injectable } from '@nestjs/common'
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
      records,
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
        title: params.scriptName || params.title || '本地剧本',
        content: params.scriptText || params.content || '',
      },
    })
    return mapScript(script)
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
