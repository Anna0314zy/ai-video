import { createModel } from '@rematch/core'
import { RootModel } from '.'

export default createModel<RootModel>()({
  state: {
    selectedVideo: {},
    selectedImage: {},
    selectedAudio: {},
    currentSelectType: 0,
  },
  reducers: {
    updateData(state, payload: any) {
      return { ...state, ...payload }
    },
  },
})
