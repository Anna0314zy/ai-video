import { Models } from '@rematch/core'
import auth from './auth'
import aiVideo from './aiVideo'
export interface RootModel extends Models<RootModel> {
  auth: typeof auth
}

export const models: RootModel = {
  auth,
  aiVideo,
}
