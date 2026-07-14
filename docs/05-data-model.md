# 数据模型

本文档基于前端类型、接口字段和当前 Prisma schema 整理。数据库 schema 位于 `apps/server/prisma/schema.prisma`，本地开发默认使用 SQLite。

## 当前数据库实体

| 实体 | 说明 |
| --- | --- |
| `User` | 用户基础信息，关联项目。 |
| `Project` | AI 内容项目，保存项目名称、学科、年级、状态、镜头数量等信息。 |
| `Session` | 剧本/聊天会话，关联项目。 |
| `SessionMessage` | 会话消息历史。 |
| `Script` | 已保存剧本，关联项目和可选会话。 |
| `Shot` | 分镜信息，关联项目。 |
| `Resource` | 图片、视频、音频等资源，关联可选分镜。 |
| `GenerationTask` | 第三方生成任务记录。 |
| `FileAsset` | 上传或外部存储文件记录。 |

## ProjectList

来源：`apps/web/src/api/models/project.ts`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 项目 ID。 |
| `projectName` | `string` | 项目名称。 |
| `projectType` | `string` | 项目类型。 |
| `subjectName` | `string` | 学科。 |
| `gradeName` | `string` | 年级。 |
| `termName` | `string` | 季度/学期。 |
| `textbookVersion` | `string` | 教材版本。 |
| `curriculumNo` | `number` | 讲次。 |
| `shotNum` | `number` | 镜头数量。 |
| `state` | `ScriptProcessing | VideoProcessing | Completed` | 项目状态。 |
| `username` | `string` | 创建人。 |
| `created` | `string` | 创建时间。 |
| `modified` | `string` | 修改时间。 |
| `sessionList` | `{ id: number }[]` | 会话列表，可选。 |

## ProjectDetailRes

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `latestSessionId` | `number` | 最近一次会话 ID。 |
| `project` | `ProjectList` | 项目详情。 |

## PageList

通用分页结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `records` | `T[]` | 当前页数据。 |
| `current` | `number` | 当前页码。 |
| `size` | `number` | 每页数量。 |
| `total` | `number` | 总条数。 |

## MessageList

来源：`apps/web/src/api/types/script.ts`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string | number` | 前端列表唯一标识或后端消息 ID。 |
| `projectId` | `number` | 项目 ID。 |
| `sessionId` | `number` | 会话 ID。 |
| `role` | `assistant | user` | 消息角色。 |
| `messageType` | `string` | 消息类型，例如用户消息、GPT 消息、文件消息。 |
| `messageContent` | `string` | 消息内容。 |
| `messageSize` | `number` | 消息大小。 |
| `fromUserId` | `number` | 发送人 ID。 |
| `fromUser` | `string` | 发送人名称。 |
| `created` | `number` | 创建时间。 |
| `attachmentFileInfo` | `object` | 附件信息。 |
| `scriptId` | `number | string` | 关联剧本 ID。 |
| `scriptName` | `string` | 关联剧本名称。 |
| `requesting` | `boolean` | 前端临时状态，表示生成中占位。 |
| `loading` | `boolean` | 前端临时状态。 |
| `userSend` | `boolean` | 前端临时状态，标记用户发送记录。 |

## ScriptPrompt

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scriptType` | `string` | 剧本类型。 |
| `scriptStyle` | `string` | 剧本风格。 |
| `scriptContent` | `string` | 剧本主题。 |
| `characters` | `string` | 主角、配角，英文逗号分隔。 |
| `duration` | `number` | 总时长，单位秒。 |
| `shotNum` | `number` | 镜头数量。 |
| `wordNum` | `number` | 剧本字数。 |

## ScriptPageList

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `projectId` | `number` | 项目 ID。 |
| `scriptId` | `number` | 剧本 ID。 |
| `source` | `number` | 来源。 |
| `shotNum` | `number` | 镜头数量。 |
| `wordNum` | `number` | 字数。 |
| `duration` | `number` | 时长。 |
| `characters` | `string` | 角色。 |
| `scriptType` | `string` | 剧本类型。 |
| `scriptStyle` | `string` | 剧本风格。 |
| `scriptContent` | `string` | 剧本内容。 |
| `modified` | `string` | 修改时间。 |
| `isFinal` | `number` | 是否为已确认剧本。 |
| `name` | `string` | 剧本名称。 |

## ShotList

来源：`apps/web/src/api/types/video.ts`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `shotId` | `number` | 分镜 ID。 |
| `narration` | `string` | 旁白/分镜描述。 |
| `status` | `completed | uncompleted` | 分镜整体状态。 |
| `sort` | `number` | 排序。 |
| `imageStatus` | `completed | uncompleted` | 图片状态。 |
| `videoStatus` | `completed | uncompleted` | 视频状态。 |
| `voiceStatus` | `completed | uncompleted` | 音频状态。 |
| `imageUrl` | `string` | 图片地址。 |
| `previewImage` | `string` | 预览图地址。 |
| `midjourneyPrompt` | `string` | 文生图 Prompt。 |

## ResourceType

| 值 | 文案 | 说明 |
| --- | --- | --- |
| `image` | 图片 | 文生图资源。 |
| `video` | 视频 | 图生视频资源。 |
| `voice` | 音频 | TTS 音频资源。 |

## ChatMessageList

`ChatMessageList` 当前等同于 `Text2imageMessage`，作为图片、视频、音频任务历史的通用消息结构使用。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `historyId` | `number` | 历史记录 ID。 |
| `taskId` | `string` | 任务 ID。 |
| `taskState` | `Queued | Processing | Completed | Transcoding | Failed` | 任务状态。 |
| `type` | `image | video | voice` | 资源类型。 |
| `created` | `string` | 创建时间。 |
| `originUrl` | `string` | 原始资源地址。 |
| `compressUrl` | `string` | 压缩资源地址。 |
| `text` | `string` | 任务文本。 |
| `resourceId` | `number` | 资源 ID。 |
| `resourceName` | `string` | 资源名称。 |
| `shotId` | `number` | 分镜 ID。 |
| `content` | `string` | 生成内容。 |
| `width` | `number` | 图片宽度。 |
| `height` | `number` | 图片高度。 |
| `options` | `Text2imageMessageOptions[]` | 图片修整/变体选项。 |
| `isTrimming` | `number` | 是否允许保存为修整图片资源。 |

## PathConfigList

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cdnPath` | `string` | CDN 域名或路径。 |
| `qiniuPathConfigList` | `Array` | 不同上传类型对应的七牛云目录配置。 |

`qiniuPathConfigList` 元素：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `image | video | voice | mjImage` | 上传类型。 |
| `name` | `string` | 展示名。 |
| `path` | `string` | 七牛云目录。 |
