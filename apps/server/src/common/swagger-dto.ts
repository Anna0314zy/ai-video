import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'admin', description: '用户名' })
  @IsString()
  username!: string

  @ApiProperty({ example: 'your-password', description: '密码' })
  @IsString()
  password!: string

  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: '登录校验时兼容旧字段传 token' })
  @IsOptional()
  @IsString()
  systemToken?: string

  @ApiPropertyOptional({ example: '10001', description: '工号或员工编号，兼容旧字段' })
  @IsOptional()
  @IsString()
  empNo?: string
}

export class PageDto {
  @ApiPropertyOptional({ example: 1, description: '当前页码' })
  @IsOptional()
  @IsNumber()
  current?: number

  @ApiPropertyOptional({ example: 10, description: '每页条数' })
  @IsOptional()
  @IsNumber()
  size?: number

  @ApiPropertyOptional({ example: '', description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string
}

export class ProjectSaveDto {
  @ApiPropertyOptional({ example: 1, description: '项目 ID，传入时更新项目' })
  @IsOptional()
  @IsNumber()
  id?: number

  @ApiProperty({ example: '七牛云接入演示项目', description: '项目名称' })
  @IsString()
  projectName!: string

  @ApiPropertyOptional({ example: 'VIDEO', description: '项目类型' })
  @IsOptional()
  @IsString()
  projectType?: string

  @ApiPropertyOptional({ example: '语文', description: '学科' })
  @IsOptional()
  @IsString()
  subjectName?: string

  @ApiPropertyOptional({ example: '三年级', description: '年级' })
  @IsOptional()
  @IsString()
  gradeName?: string

  @ApiPropertyOptional({ example: '春季', description: '学期' })
  @IsOptional()
  @IsString()
  termName?: string

  @ApiPropertyOptional({ example: '人教版', description: '教材版本' })
  @IsOptional()
  @IsString()
  textbookVersion?: string

  @ApiPropertyOptional({ example: 1, description: '讲次' })
  @IsOptional()
  @IsNumber()
  curriculumNo?: number
}

export class ProjectDeleteDto {
  @ApiProperty({ example: [1, 2], description: '需要删除的项目 ID 列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  projectIdList!: number[]
}

export class CreateSessionDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number
}

export class SessionHistoriesDto extends PageDto {
  @ApiProperty({ example: 1, description: '会话 ID' })
  @IsNumber()
  sessionId!: number

  @ApiPropertyOptional({ example: 1721030000000, description: '加载该创建时间之前的消息，毫秒时间戳或 ISO 时间字符串' })
  @IsOptional()
  beforeCreated?: number | string

  @ApiPropertyOptional({ example: 1001, description: '加载该消息 ID 之前的消息，用于同时间戳排序兜底' })
  @IsOptional()
  @IsNumber()
  beforeId?: number
}

export class GenerateShotPromptDto {
  @ApiPropertyOptional({ example: '剧情', description: '剧本类型' })
  @IsOptional()
  @IsString()
  scriptType?: string

  @ApiPropertyOptional({ example: '故事型', description: '剧本风格' })
  @IsOptional()
  @IsString()
  scriptStyle?: string

  @ApiPropertyOptional({ example: '讲解太阳系的八大行星', description: '剧本主题或内容' })
  @IsOptional()
  @IsString()
  scriptContent?: string

  @ApiPropertyOptional({ example: 60, description: '视频时长，单位秒' })
  @IsOptional()
  @IsNumber()
  duration?: number

  @ApiPropertyOptional({ example: 6, description: '分镜数量' })
  @IsOptional()
  @IsNumber()
  shotNum?: number
}

export class SaveScriptDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number

  @ApiPropertyOptional({ example: 1, description: '会话 ID' })
  @IsOptional()
  @IsNumber()
  sessionId?: number

  @ApiPropertyOptional({ example: '太阳系科普剧本', description: '剧本名称' })
  @IsOptional()
  @IsString()
  scriptName?: string

  @ApiPropertyOptional({ example: '第一幕：太阳升起...', description: '剧本文本' })
  @IsOptional()
  @IsString()
  scriptText?: string
}

export class PageScriptDto extends PageDto {
  @ApiPropertyOptional({ example: 1, description: '项目 ID' })
  @IsOptional()
  @IsNumber()
  projectId?: number
}

export class StreamChatDto {
  @ApiProperty({ example: '帮我生成一个 1 分钟的太阳系科普剧本', description: '用户输入文本' })
  @IsString()
  text!: string

  @ApiPropertyOptional({ example: 1, description: '项目 ID' })
  @IsOptional()
  @IsNumber()
  projectId?: number

  @ApiPropertyOptional({ example: 1, description: '会话 ID' })
  @IsOptional()
  @IsNumber()
  sessionId?: number
}

export class ResendMessageDto {
  @ApiProperty({ example: 1, description: '会话 ID' })
  @IsNumber()
  sessionId!: number

  @ApiProperty({ example: 1001, description: '需要重新生成的消息 ID' })
  @IsNumber()
  sessionChatId!: number
}

export class DeleteScriptDto {
  @ApiProperty({ example: [1, 2], description: '剧本 ID 列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  scriptIdList!: number[]
}

export class ConfirmScriptDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number

  @ApiProperty({ example: 1, description: '确认使用的剧本 ID' })
  @IsNumber()
  scriptId!: number
}

export class TextToVideoTaskDto {
  @ApiProperty({ example: '一只纸飞机飞过教室', description: '文生视频 prompt' })
  @IsString()
  prompt!: string
}

export class TextToImageTaskDto {
  @ApiProperty({ example: '卡通风格太阳系科普海报', description: '文生图 prompt' })
  @IsString()
  prompt!: string

  @ApiPropertyOptional({ example: 1, description: '分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number
}

export class ImageToVideoTaskDto {
  @ApiProperty({ example: 'image/demo.png', description: '七牛云图片对象 key 或图片 URL' })
  @IsString()
  imageUrl!: string

  @ApiPropertyOptional({ example: '镜头缓慢推进', description: '图生视频 prompt' })
  @IsOptional()
  @IsString()
  prompt?: string
}

export class ImagePromptDto {
  @ApiProperty({ example: '可爱的卡通太阳系插画', description: '图片生成中文 prompt' })
  @IsString()
  prompt!: string
}

export class AudioTaskDto {
  @ApiProperty({ example: '大家好，今天我们学习太阳系。', description: '需要合成的音频文本' })
  @IsString()
  text!: string
}

export class QiniuUploadTokenQueryDto {
  @ApiPropertyOptional({ example: 'qiqi123456', description: '七牛云 bucketName，不传使用服务端默认配置' })
  @IsOptional()
  @IsString()
  bucketName?: string
}

export class FileUploadDto {
  @ApiPropertyOptional({ example: 'demo.png', description: '上传文件名。Swagger 调试占位，真实上传使用 multipart/form-data。' })
  @IsOptional()
  @IsString()
  fileName?: string
}

export class SaveImageResourceDto {
  @ApiProperty({ example: 1, description: '分镜 ID' })
  @IsNumber()
  shotId!: number

  @ApiProperty({ example: 'image/demo.png', description: '七牛云图片对象 key' })
  @IsString()
  originUrl!: string

  @ApiPropertyOptional({ example: 'image/demo-small.png', description: '压缩图对象 key' })
  @IsOptional()
  @IsString()
  compressUrl?: string
}

export class ResourcePageQueryDto {
  @ApiPropertyOptional({ example: 1, description: '当前页码' })
  @IsOptional()
  @IsNumber()
  pageIndex?: number

  @ApiPropertyOptional({ example: 10, description: '每页条数' })
  @IsOptional()
  @IsNumber()
  pageSize?: number

  @ApiPropertyOptional({ example: 1, description: '项目或分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number

  @ApiPropertyOptional({ example: 'image', description: '资源类型：image/video/voice' })
  @IsOptional()
  @IsString()
  type?: string
}

export class ResourceImportDto {
  @ApiProperty({ example: 1, description: '分镜 ID' })
  @IsNumber()
  shotId!: number

  @ApiProperty({ example: 'voice/demo.mp3', description: '七牛云对象 key' })
  @IsString()
  originPath!: string

  @ApiProperty({ example: 'voice', description: '资源类型：image/video/voice' })
  @IsString()
  type!: string
}

export class ShotListQueryDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number
}

export class SaveShotListDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number

  @ApiProperty({ example: [], description: '分镜列表' })
  @IsArray()
  shotInfoDtoList!: unknown[]
}

export class PackageBatchDto {
  @ApiProperty({ example: [1, 2, 3], description: '分镜 ID 列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  shotIds!: number[]
}
