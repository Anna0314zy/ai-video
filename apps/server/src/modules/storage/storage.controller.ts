import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { createHmac } from 'node:crypto'
import { AppException } from '../../common/app-exception.js'
import { FileUploadDto, SaveImageResourceDto } from '../../common/swagger-dto.js'
import { ConfigService } from '../../config/config.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'

@ApiTags('存储 Storage')
@Controller()
export class StorageController {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Get('api/qiniu/v1/upload-token')
  @ApiOperation({ summary: '获取七牛云 uploadToken', description: '服务端用 .env 中的七牛云密钥签发临时上传 token。' })
  @ApiQuery({ name: 'bucketName', required: false, example: 'qiqi1234567', description: '七牛云 bucketName，不传使用服务端默认配置' })
  uploadToken(@Query('bucketName') bucketName: string) {
    const storage = this.configService.value.storage
    if (!storage.accessKey || !storage.secretKey) {
      throw new AppException('feature-not-configured', '七牛云存储尚未配置')
    }

    const bucket = bucketName || storage.bucketName
    const deadline = Math.floor(Date.now() / 1000) + storage.tokenExpiresSeconds
    const policy = {
      scope: bucket,
      deadline,
      returnBody:
        '{"key":"$(key)","hash":"$(etag)","bucket":"$(bucket)","name":"$(fname)","size":$(fsize),"mimeType":"$(mimeType)"}',
    }

    return {
      provider: storage.provider,
      bucketName: bucket,
      uploadHost: storage.uploadHost,
      publicDomain: storage.publicDomain,
      uploadToken: createQiniuUploadToken(policy, storage.accessKey, storage.secretKey),
      startTime: Math.floor(Date.now() / 1000),
      expiredTime: deadline,
    }
  }

  @Get('api/qiniu/v1/pathConfig')
  @ApiOperation({ summary: '获取七牛云上传路径配置', description: '无需传参。' })
  pathConfig() {
    const storage = this.configService.value.storage
    const qiniuPathConfigList = [
      { type: 'image', name: '图片', path: 'image' },
      { type: 'video', name: '视频', path: 'video' },
      { type: 'voice', name: '音频', path: 'voice' },
      { type: 'mjImage', name: '文生图', path: 'mj-image' },
      { type: 'script', name: '剧本', path: 'script' },
    ]

    return {
      cdnPath: storage.publicDomain,
      qiniuPathConfigList,
      storagePathConfigList: qiniuPathConfigList,
    }
  }

  @Post('api/file/v1/upload')
  @ApiOperation({ summary: '兼容文件上传接口', description: '真实素材上传走七牛云直传，此接口保留 fileId/fileName 兼容结构。' })
  @ApiBody({ type: FileUploadDto })
  async upload(@Body() body: FileUploadDto) {
    if (!body.fileName) {
      throw new AppException('validation', 'fileName 不能为空；真实文件上传请使用七牛云直传')
    }

    const asset = await this.prisma.fileAsset.create({
      data: {
        fileName: body.fileName,
        bucket: this.configService.value.storage.bucketName,
        region: this.configService.value.storage.provider,
      },
    })

    return {
      fileId: asset.id,
      fileName: asset.fileName,
      url: asset.url,
    }
  }

  @Post('api/text2image/v1/image/resource/save')
  @ApiOperation({ summary: '保存图片资源' })
  @ApiBody({ type: SaveImageResourceDto })
  async saveImageResource(@Body() body: SaveImageResourceDto) {
    const resource = await this.prisma.resource.create({
      data: {
        shotId: body.shotId,
        type: 'image',
        url: body.compressUrl || body.originUrl,
        origin: body.originUrl,
      },
    })

    return {
      current: 1,
      size: 10,
      total: 1,
      records: [mapResource(resource)],
    }
  }
}

function mapResource(resource: any) {
  return {
    ...resource,
    resourceId: resource.id,
    originPath: resource.origin,
    created: resource.createdAt?.toISOString?.(),
  }
}

function createQiniuUploadToken(policy: Record<string, unknown>, accessKey: string, secretKey: string) {
  const encodedPolicy = base64UrlEncode(JSON.stringify(policy))
  const sign = createHmac('sha1', secretKey).update(encodedPolicy).digest()
  const encodedSign = base64UrlEncode(sign)
  return `${accessKey}:${encodedSign}:${encodedPolicy}`
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
}
