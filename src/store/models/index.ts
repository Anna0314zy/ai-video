import { Models } from '@rematch/core'
import auth from './auth'
import common from './common'
export interface RootModel extends Models<RootModel> {
  auth: typeof auth
  common: typeof common
}

export const models: RootModel = {
  auth,
  common,
}
