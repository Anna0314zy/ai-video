import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from './config.service.js'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'apps/server/.env'],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigAppModule {}
