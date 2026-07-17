import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

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

  @ApiPropertyOptional({ example: 800, description: '脚本字数' })
  @IsOptional()
  @IsNumber()
  wordNum?: number

  @ApiPropertyOptional({ example: '哪吒，小哪吒', description: '主角/角色' })
  @IsOptional()
  @IsString()
  characters?: string

  @ApiPropertyOptional({ example: '东海边', description: '场景设定' })
  @IsOptional()
  @IsString()
  sceneSetting?: string

  @ApiPropertyOptional({ example: '童趣、简洁', description: '旁白要求' })
  @IsOptional()
  @IsString()
  narrationRequirement?: string

  @ApiPropertyOptional({ example: '写实电影感', description: '画面风格' })
  @IsOptional()
  @IsString()
  visualStyle?: string

  @ApiPropertyOptional({ example: '不要血腥暴力', description: '禁用内容' })
  @IsOptional()
  @IsString()
  negativePrompt?: string

  @ApiPropertyOptional({ example: '低龄儿童观看', description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class SaveScriptDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number

  @ApiPropertyOptional({ example: 1, description: '会话 ID' })
  @IsOptional()
  @IsNumber()
  sessionId?: number

  @ApiPropertyOptional({ example: 1001, description: '需要标记为剧本的助手消息 ID' })
  @IsOptional()
  sessionChatId?: number | string

  @ApiPropertyOptional({ example: '太阳系科普剧本', description: '剧本名称' })
  @IsOptional()
  @IsString()
  scriptName?: string

  @ApiPropertyOptional({ example: '第一幕：太阳升起...', description: '剧本文本' })
  @IsOptional()
  @IsString()
  scriptText?: string

  @ApiPropertyOptional({ example: '剧情', description: '剧本类型' })
  @IsOptional()
  @IsString()
  scriptType?: string

  @ApiPropertyOptional({ example: '故事型', description: '剧本风格' })
  @IsOptional()
  @IsString()
  scriptStyle?: string

  @ApiPropertyOptional({ example: 120, description: '总时长，单位秒' })
  @IsOptional()
  @IsNumber()
  duration?: number

  @ApiPropertyOptional({ example: 14, description: '镜头数量' })
  @IsOptional()
  @IsNumber()
  shotNum?: number

  @ApiPropertyOptional({ example: '哪吒', description: '主角' })
  @IsOptional()
  @IsString()
  characters?: string

  @ApiPropertyOptional({ example: '哪吒脑海', description: '剧本主题或内容' })
  @IsOptional()
  @IsString()
  scriptContent?: string

  @ApiPropertyOptional({ example: 'ai', description: '剧本来源：ai/import/manual' })
  @IsOptional()
  @IsString()
  source?: string

  @ApiPropertyOptional({ example: '未命名剧本', description: '兼容旧字段：剧本标题' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ example: '第一幕...', description: '兼容旧字段：剧本正文' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ example: '东海边', description: '场景设定' })
  @IsOptional()
  @IsString()
  sceneSetting?: string

  @ApiPropertyOptional({ example: '童趣、简洁', description: '旁白要求' })
  @IsOptional()
  @IsString()
  narrationRequirement?: string

  @ApiPropertyOptional({ example: '写实电影感', description: '画面风格' })
  @IsOptional()
  @IsString()
  visualStyle?: string

  @ApiPropertyOptional({ example: '不要血腥暴力', description: '禁用内容' })
  @IsOptional()
  @IsString()
  negativePrompt?: string

  @ApiPropertyOptional({ example: '低龄儿童观看', description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string
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
  @ApiPropertyOptional({ example: '一只纸飞机飞过教室', description: '文生视频 prompt' })
  @IsOptional()
  @IsString()
  prompt?: string

  @ApiPropertyOptional({ example: '一只纸飞机飞过教室', description: '兼容前端旧字段，等同 prompt' })
  @IsOptional()
  @IsString()
  text?: string

  @ApiPropertyOptional({ example: 1, description: '分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number

  @ApiPropertyOptional({ example: 5, description: '视频时长，单位秒' })
  @IsOptional()
  @IsNumber()
  duration?: number

  @ApiPropertyOptional({ example: '16:9', description: '画幅比例' })
  @IsOptional()
  @IsString()
  ratio?: string

  @ApiPropertyOptional({ example: '缓慢推进', description: '前端视频镜头运动配置' })
  @IsOptional()
  @IsString()
  cameraMovement?: string

  @ApiPropertyOptional({ example: '轻微', description: '前端视频运动强度配置' })
  @IsOptional()
  @IsString()
  motionStrength?: string
}

export class TextToImageTaskDto {
  @ApiPropertyOptional({ example: '卡通风格太阳系科普海报', description: '文生图 prompt' })
  @IsOptional()
  @IsString()
  prompt?: string

  @ApiPropertyOptional({ example: '卡通风格太阳系科普海报', description: '兼容前端旧字段，等同 prompt' })
  @IsOptional()
  @IsString()
  text?: string

  @ApiPropertyOptional({ example: 1, description: '分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number

  @ApiPropertyOptional({ example: 1, description: '项目 ID' })
  @IsOptional()
  @IsNumber()
  projectId?: number

  @ApiPropertyOptional({ example: { style: '写实电影感', aspectRatio: '16:9' }, description: '前端图片生成中文配置' })
  @IsOptional()
  @IsObject()
  imageConfig?: Record<string, unknown>
}

export class ImageToVideoTaskDto {
  @ApiPropertyOptional({ example: 'image/demo.png', description: '七牛云图片对象 key 或图片 URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiPropertyOptional({ example: '镜头缓慢推进', description: '图生视频 prompt' })
  @IsOptional()
  @IsString()
  prompt?: string

  @ApiPropertyOptional({ example: '镜头缓慢推进', description: '兼容前端旧字段，等同 prompt' })
  @IsOptional()
  @IsString()
  text?: string

  @ApiPropertyOptional({ example: 1, description: '分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number

  @ApiPropertyOptional({ example: 5, description: '视频时长，单位秒' })
  @IsOptional()
  @IsNumber()
  duration?: number

  @ApiPropertyOptional({ example: '16:9', description: '画幅比例' })
  @IsOptional()
  @IsString()
  ratio?: string

  @ApiPropertyOptional({ example: '缓慢推进', description: '前端图生视频镜头运动配置' })
  @IsOptional()
  @IsString()
  cameraMovement?: string

  @ApiPropertyOptional({ example: '轻微', description: '前端图生视频运动强度配置' })
  @IsOptional()
  @IsString()
  motionStrength?: string
}

export class ImagePromptDto {
  @ApiPropertyOptional({ example: '可爱的卡通太阳系插画', description: '图片生成中文 prompt' })
  @IsOptional()
  @IsString()
  prompt?: string

  @ApiPropertyOptional({ example: 1, description: '分镜 ID' })
  @IsOptional()
  @IsNumber()
  shotId?: number

  @ApiPropertyOptional({ example: 'image/demo.png', description: '参考图片 URL 或对象 key' })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiPropertyOptional({ example: { btnName: '默认', btnValue: '电影感', btnType: 'style' }, description: '图片 prompt 选项' })
  @IsOptional()
  button?: {
    btnName?: string
    btnValue?: string
    btnType?: string
  }

  @ApiPropertyOptional({ example: { style: '写实电影感', aspectRatio: '16:9' }, description: '前端图片生成中文配置' })
  @IsOptional()
  @IsObject()
  imageConfig?: Record<string, unknown>
}

export class AudioTaskDto {
  @ApiProperty({ example: '大家好，今天我们学习太阳系。', description: '需要合成的音频文本' })
  @IsString()
  text!: string
}

export class QiniuUploadTokenQueryDto {
  @ApiPropertyOptional({ example: 'qiqi1234567', description: '七牛云 bucketName，不传使用服务端默认配置' })
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

export class ResourceConfirmDto {
  @ApiProperty({ example: 1, description: '分镜 ID' })
  @IsNumber()
  shotId!: number

  @ApiPropertyOptional({ example: 1, description: '需要确认的资源 ID' })
  @IsOptional()
  @IsNumber()
  resourceId?: number

  @ApiPropertyOptional({ example: 'image/demo.png', description: '直接确认导入资源时使用的七牛对象 key' })
  @IsOptional()
  @IsString()
  originPath?: string

  @ApiProperty({ example: 'image', description: '资源类型：image/video/voice' })
  @IsString()
  type!: string
}

export class UpdateShotDto {
  @ApiProperty({ example: 1, description: '项目 ID' })
  @IsNumber()
  projectId!: number

  @ApiProperty({ example: 1, description: '分镜 ID' })
  @IsNumber()
  shotId!: number

  @ApiPropertyOptional({ example: '镜头1：海边奔跑', description: '镜头标题' })
  @IsOptional()
  @IsString()
  shotName?: string

  @ApiPropertyOptional({ example: '哪吒赤脚跑过沙滩。', description: '镜头内容' })
  @IsOptional()
  @IsString()
  shotContent?: string

  @ApiPropertyOptional({ example: 'A joyful child...', description: '图片提示词' })
  @IsOptional()
  @IsString()
  visualPrompt?: string

  @ApiPropertyOptional({ example: 'image/demo.png', description: '确认图片缩略图 key' })
  @IsOptional()
  @IsString()
  previewImage?: string

  @ApiPropertyOptional({ example: 'Camera slowly pushes in.', description: '视频提示词' })
  @IsOptional()
  @IsString()
  videoPrompt?: string

  @ApiPropertyOptional({ example: '哪吒在海边奔跑。', description: '旁白文本' })
  @IsOptional()
  @IsString()
  narration?: string

  @ApiPropertyOptional({ example: '海浪声，儿童笑声', description: '音效描述' })
  @IsOptional()
  @IsString()
  soundEffects?: string

  @ApiPropertyOptional({ example: '轻快童趣的国风配乐', description: '背景音乐描述' })
  @IsOptional()
  @IsString()
  backgroundMusic?: string

  @ApiPropertyOptional({ example: [1, 2], description: '素材库音效资源 ID 列表' })
  @IsOptional()
  soundEffectResourceIds?: number[] | string
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
