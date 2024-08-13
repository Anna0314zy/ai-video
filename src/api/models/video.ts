import api from '../index'
const http = import.meta.env.VITE_API_SERVER
// 获取图片配置接口
export const getImagePromptBtnList = (shotId: number) => {
  return api.get<
    {
      btnType: string
      btnName: string
      btnValue?: string
    }[]
  >(`${http}/api/prompt/v1/parseMJPrompt/btnList`, { shotId })
}
interface ApiOptions {
  description: string
  value: string
}
// 获取所有的语言
export const getAllLanguages = () => {
  return api.get<{
    localeNameElementRespList: ApiOptions[]
  }>(`${http}/api/tts/v1/languages`)
}
//根据语言获取所有的声音
export const getVoices = (localeName: string) => {
  return api.get<{ voiceElementRespList: ApiOptions[] }>(`${http}/api/tts/v1/voices/${localeName}`)
}
//根据声音获取所有的情感
export const getStyles = (val: string) => {
  return api.get<{ styleElementRespList: ApiOptions[] }>(`${http}/api/tts/v1/styles/${val}`)
}
//  根获取其他声音参数（声调、语速等）
export const getOtherAudioConfig = () => {
  return api.get<{ pitchElementRespList: ApiOptions[]; rateElementRespList: ApiOptions[] }>(
    `${http}/api/tts/v1/otherOptions`,
  )
}
