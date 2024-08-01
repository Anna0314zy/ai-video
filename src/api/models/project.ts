import api from '../index'
const http = import.meta.env.VITE_API_SERVER
export interface ProjectList {
  created: string
  curriculumNo: number
  gradeName: string
  modified: string
  projectName: string
  projectType: string
  shotNum: number
  state: string
  subjectName: string
  termName: string
  textbookVersion: string
  username: string
  id: string
}
export interface PageList {
  size: number
  current: number
  total: number
  records: ProjectList[]
}
// 项目分页列表
export const projectList = (params: any) => {
  return api.post<PageList>(`${http}/api/project/page`, params)
}

// 新建项目
export const projectSave = (params: any) => {
  return api.post(`${http}/api/project/save`, params)
}
