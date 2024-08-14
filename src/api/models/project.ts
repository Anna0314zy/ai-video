import api from '../index'
import { ScriptStatus } from '../types/script'
const http = import.meta.env.VITE_API_SERVER
export interface ProjectList {
  created: string
  curriculumNo: number
  gradeName: string
  modified: string
  projectName: string
  projectType: string
  shotNum: number
  state: keyof typeof ScriptStatus
  subjectName: string
  termName: string
  textbookVersion: string
  username: string
  id: string
  sessionList?: { id: number }[]
}
export interface PageList<T> {
  size: number
  current: number
  total: number
  records: T[]
}
// 项目分页列表
export const projectList = (params: any) => {
  return api.post<PageList<ProjectList>>(`${http}/api/project/page`, params)
}

// 新建项目
export const projectSave = (params: any) => {
  return api.post(`${http}/api/project/save`, params)
}

interface ProjectDetailRes {
  latestSessionId?: number
  project: ProjectList
}
// 获取项目详情
export const getProjectDetail = (projectId: number) => {
  return api.get<ProjectDetailRes>(`${http}/api/project/detail`, { projectId })
}
// 获取学科列表
export const getListSubjectName = () => {
  return api.get<string[]>(`${http}/api/project/v1/listSubjectName`, {})
}

export const getListTermName = () => {
  return api.get<string[]>(`${http}/api/project/v1/listTermName`, {})
}
