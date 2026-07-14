import { Injectable } from '@nestjs/common'
import { buildServerConfig, type ServerConfig } from './server-config.js'

@Injectable()
export class ConfigService {
  readonly value: ServerConfig

  constructor() {
    this.value = buildServerConfig()
  }
}
