import { createModel } from '@rematch/core'
import { RootModel } from '.'

interface PageState {
    token: boolean
  }

export default createModel<RootModel>()({
  state: {
    token: false
  } as PageState,
  reducers: {
    updateToken(state, payload) {
        state.token = payload
    }
  },
  effects: dispatch => ({
   
  }),
})
