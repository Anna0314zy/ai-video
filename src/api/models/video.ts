import api from '../index'
const http = import.meta.env.VITE_API_SERVER
// 获取图片配置接口
export const getPromptConfig = (shotId: number) => {
  console.log('shotId', shotId)
  return api.get<number>(`${http}/api/prompt/v1/parseMJPrompt/btnList`, { shotId })
}
