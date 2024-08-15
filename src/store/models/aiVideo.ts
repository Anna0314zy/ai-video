import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { ResourceType, ShotList } from '@/api/types/video'
import * as api from '@/api/models/video'
interface AiVideoState {
  currentSelectType: ResourceType
  currentShotId: number
  shotList: ShotList[]
  [key: string]: any
}
export default createModel<RootModel>()({
  state: {
    selectedVideo: {},
    selectedImage: {},
    selectedAudio: {},
    currentSelectType: 'image',
    currentShotId: -1, // 当前选中的
    shotList: [],
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
        currentShotId: shotBaseInfoList[0].shotId,
      })
    },
  }),
})
