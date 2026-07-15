import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module.js'
import { AppErrorFilter } from './common/app-error.filter.js'
import { ResponseInterceptor } from './common/response.interceptor.js'
import { ConfigService } from './config/config.service.js'
import { LlmService } from './llm/llm.service.js'
import { attachStompBroker } from './modules/notification/stomp-broker.js'
import { PrismaService } from './prisma/prisma.service.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService).value

  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  app.useGlobalFilters(new AppErrorFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Content Platform API')
    .setDescription('AI 内容平台 NestJS 服务端接口')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api-docs', app, document)

  attachStompBroker(app.getHttpServer(), app.get(LlmService), app.get(PrismaService))

  await app.listen(config.port)
  console.log(`AI content platform server is running on ${config.port}`)
  console.log(`Swagger docs are available at http://localhost:${config.port}/api-docs`)
}

bootstrap()
