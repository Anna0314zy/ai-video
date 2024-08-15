import { createModel } from '@rematch/core'
import { RootModel } from '.'

export default createModel<RootModel>()({
  state: {
    selectedVideo: {},
    selectedImage: {},
    selectedAudio: {},
    currentSelectType: 'image',
  },
  reducers: {
    updateData(state, payload: any) {
      console.log('%c 🚀 ~ [ payload ]-13', 'font-size:14px; background:green; color:#fff;', payload)
      return { ...state, ...payload }
    },
  },
})
