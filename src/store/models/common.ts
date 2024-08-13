import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { PathConfigList } from '@/api/types/video'
import * as api from '@/api/models/common'
interface CommonState {
  pathConfig: PathConfigList
}

export default createModel<RootModel>()({
  state: {
    pathConfig: {},
  } as CommonState,
  reducers: {
    updateData(state, params: Partial<CommonState>) {
      return Object.assign(state, params)
    },
  },
  effects: dispatch => ({
    async getPathConfig() {
      const res = await api.getPathConfig()
      dispatch.common.updateData({ pathConfig: res })
    },
  }),
})
