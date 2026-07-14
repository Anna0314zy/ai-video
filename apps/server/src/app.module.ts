import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './common/auth.guard.js'
import { AccountModule } from './modules/account/account.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { CommonModule } from './modules/common/common.module.js'
import { GenerationModule } from './modules/generation/generation.module.js'
import { HealthModule } from './modules/health/health.module.js'
import { NotificationModule } from './modules/notification/notification.module.js'
import { ProjectModule } from './modules/project/project.module.js'
import { ScriptModule } from './modules/script/script.module.js'
import { StorageModule } from './modules/storage/storage.module.js'
import { ConfigAppModule } from './config/config.module.js'
import { LlmModule } from './llm/llm.module.js'
import { PrismaModule } from './prisma/prisma.module.js'

@Module({
  imports: [
    ConfigAppModule,
    PrismaModule,
    LlmModule,
    HealthModule,
    AuthModule,
    AccountModule,
    ProjectModule,
    ScriptModule,
    GenerationModule,
    StorageModule,
    CommonModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
