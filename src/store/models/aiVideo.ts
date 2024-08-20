import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { ResourceType, ShotList } from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
interface AiVideoState {
  currentSelectType: ResourceType
  currentShotId: number
  shotList: Array<any>
  [key: string]: any
}
export default createModel<RootModel>()({
  state: {
    selectedVideo: {},
    selectedImage: {},
    selectedAudio: {},
    selectedShot: {},
    currentSelectType: 'image',
    currentShotId: 0, // 当前选中的
    shotList: [],
    resourceList: {},
  } as AiVideoState,
  reducers: {
    updateData(state, payload: any) {
      console.log('%c 🚀 ~ [ payload ]-13', 'font-size:14px; background:green; color:#fff;', payload)
      return { ...state, ...payload }
    },
  },
  effects: dispatch => ({
    async getShotListByProjectId(id: number) {
      const { shotBaseInfoList } = await api.getShotListByProjectId(id)
      dispatch.aiVideo.updateData({
        shotList: shotBaseInfoList || [],
        currentShotId: shotBaseInfoList[0]?.shotId,
        selectedShot: shotBaseInfoList[0],
      })
    },
    async getResourceList(params: { shotId: number; pageSize?: number; pageIndex?: number; type: string }) {
      // console.log('%c 🚀 ~ [  ]-37', 'font-size:14px; background:green; color:#fff;', state.currentSelectType)
      const res = await api.getResourceList(params)
      dispatch.aiVideo.updateData({
        resourceList: res,
      })
    },
  }),
})
