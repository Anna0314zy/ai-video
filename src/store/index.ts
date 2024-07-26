/* eslint-disable no-void */
import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import { models, RootModel } from './models/index'
import immer from '@rematch/immer'
export const store = init<RootModel>({
  name: 'config-store',
  models,
  plugins: [
    // persist(persistConfig),
    immer(),
    // loading(),
  ],
});
(window as any).store = store
export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
