import { Models } from '@rematch/core'
import auth from './auth'
import common from './common'
import aiVideo from './aiVideo'
export interface RootModel extends Models<RootModel> {
  auth: typeof auth
  common: typeof common
  aiVideo: typeof aiVideo
}

export const models: RootModel = {
  auth,
  common,
  aiVideo,
}
