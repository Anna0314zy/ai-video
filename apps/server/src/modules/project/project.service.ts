import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service.js'
import { AppException } from '../../common/app-exception.js'

interface CurrentUser {
  id: number
  accountId: string
  username: string
}

@Injectable()
export class ProjectService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async page(params: { current?: number; size?: number }, user?: CurrentUser) {
    const current = params.current || 1
    const size = params.size || 10
    const where = {
      ...(user?.id ? { ownerId: user.id } : {}),
      ...(paramsHasKeyword(params) ? { projectName: { contains: String((params as any).keyword) } } : {}),
    }
    const [total, records] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
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
      records: records.map(mapProject),
    }
  }

  async save(params: any, user?: CurrentUser) {
    const id = Number(params.id || params.projectId || 0)
    if (!params.projectName && !params.name) {
      throw new AppException('validation')
    }
    const data = {
      projectName: params.projectName || params.name,
      projectType: params.projectType,
      subjectName: params.subjectName,
      termName: params.termName,
      gradeName: params.gradeName,
      curriculumNo: toOptionalNumber(params.curriculumNo),
      textbookVersion: params.textbookVersion,
      state: params.state || 'SCRIPT_INIT',
      shotNum: toOptionalNumber(params.shotNum) || 0,
      username: user?.username || params.username,
      ownerId: user?.id,
    }

    const project =
      id > 0
        ? await this.prisma.project.upsert({
            where: { id },
            create: data,
            update: data,
          })
        : await this.prisma.project.create({ data })

    return mapProject(project)
  }

  async detail(projectId: number, user?: CurrentUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ...(user?.id ? { ownerId: user.id } : {}),
      },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!project) {
      throw new AppException('not-found')
    }

    return {
      latestSessionId: project.sessions[0]?.id,
      project: mapProject(project),
    }
  }

  async delete(projectIdList: number[], user?: CurrentUser) {
    const ids = projectIdList.map(Number).filter(Number.isFinite)
    if (ids.length > 0) {
      await this.prisma.project.deleteMany({
        where: {
          id: { in: ids },
          ...(user?.id ? { ownerId: user.id } : {}),
        },
      })
    }
    return projectIdList
  }
}

function mapProject(project: any) {
  return {
    ...project,
    id: String(project.id),
    created: project.createdAt?.toISOString?.() || project.created,
    modified: project.updatedAt?.toISOString?.() || project.modified,
  }
}

function paramsHasKeyword(params: any) {
  return typeof params.keyword === 'string' && params.keyword.trim().length > 0
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
