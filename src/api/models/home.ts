import api from '../index'
const http = import.meta.env.VITE_API_SERVER

// 项目分页列表
export const projectList =(params:any)=>{
    return api.post(`${http}/api/project/page`,params)
}

// 新建项目
export const projectSave =(params:any)=>{
    return api.post(`${http}/api/project/save`,params)
}
