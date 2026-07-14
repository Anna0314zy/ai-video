# 接口说明

本地启动 NestJS 后端后，可以通过 Swagger 页面查看和测试接口：

```text
http://localhost:4000/api-docs
```

项目、会话和剧本接口已经接入 Prisma，本地默认使用 SQLite。Swagger 页面中的主要 HTTP 接口已补充 DTO 示例，可直接填写参数调试。

## 请求封装

普通接口统一经过 `apps/web/src/api/index.ts`：

- `api.get<T>(url, params, configs)`
- `api.post<T>(url, data, configs)`
- `api.put<T>(url, data, configs)`
- `api.del<T>(url, data, configs)`

默认行为：

| 项 | 说明 |
| --- | --- |
| 超时 | 120 秒。 |
| 请求头 | `Content-Type: application/json`。 |
| 认证 | 自动从 `localStorage.token` 写入 `Authorization`。 |
| 成功码 | 响应体 `code` 为 `200`。 |
| 登录过期 | 响应体 `code` 为 `30001` 时清 Token 并跳转登录。 |
| 错误提示 | 优先展示响应体 `message`，否则展示错误消息。 |

## Auth API

文件：`apps/web/src/api/models/auth.ts`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `login` | `/classroom-slides/auth/login` | 使用 `systemToken` 登录。 |
| `checkLogin` | `/classroom-slides/auth/check` | 校验 `systemToken`。 |
| `logout` | `/classroom-slides/auth/logout` | 登出。 |
| `getUerInfo` | `/api/account/userInfo/get` | 获取当前用户信息。 |

当前页面鉴权主要调用 `getUerInfo`。

## Project API

文件：`apps/web/src/api/models/project.ts`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `projectList` | `/api/project/page` | 项目分页列表。 |
| `projectSave` | `/api/project/save` | 新建项目。 |
| `getProjectDetail` | `/api/project/detail` | 获取项目详情和最近会话。 |
| `getListSubjectName` | `/api/project/v1/listSubjectName` | 获取学科列表。 |
| `getListTermName` | `/api/project/v1/listTermName` | 获取季度/学期列表。 |
| `delProjectList` | `/api/project/delete` | 批量删除项目。 |

## Script API

文件：`apps/web/src/api/models/aiScript.ts`

| 方法/常量 | 路径 | 说明 |
| --- | --- | --- |
| `CHAT_URL` | `/api/text/v1/ai/stream/sessionChat` | 会话聊天流式接口。 |
| `CHAT_URL_AGAIN` | `/api/text/v1/ai/stream/resendMessage` | 重新生成消息流式接口。 |
| `downloadTemplateUrl` | `/api/text/v1/downloadTemplate` | 下载剧本模板。 |
| `createChat` | `/api/session/create` | 新建会话。 |
| `getChatHistories` | `/api/session/chat/getHistories` | 获取会话历史。 |
| `getScriptPrompt` | `/api/prompt/v1/generateShot/parse` | 解析剧本配置并生成 Prompt。 |
| `getListScriptStyle` | `/api/text/v1/listScriptStyle` | 获取剧本风格。 |
| `getListScripType` | `/api/text/v1/listScriptType` | 获取剧本类型。 |
| `fileUpload` | `/api/file/v1/upload` | 上传附件文件。 |
| `saveScript` | `/api/text/v2/saveScript` | 将对话内容保存为剧本及镜头。 |
| `getPageScript` | `/api/text/v1/pageScript` | 剧本分页查询。 |
| `previewScript` | `/api/text/v1/previewScript` | 剧本预览。 |
| `uploadScript` | `/api/text/v1/importScript/{projectId}` | 导入剧本。 |
| `deleteScript` | `/api/text/v1/deleteScript` | 删除剧本。 |
| `confirmScript` | `/api/text/v1/confirmScript` | 确认剧本。 |

## Video / Resource API

文件：`apps/web/src/api/models/aiVideo.ts`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getImagePromptBtnList` | `/api/prompt/v1/parseMJPrompt/btnList` | 获取图片 Prompt 按钮配置。 |
| `getAllLanguages` | `/api/tts/v1/languages` | 获取 TTS 语言列表。 |
| `getVoices` | `/api/tts/v1/voices/{localeName}` | 获取 TTS 声音列表。 |
| `getStyles` | `/api/tts/v1/styles/{voice}` | 获取 TTS 情感/风格。 |
| `getOtherAudioConfig` | `/api/tts/v1/otherOptions` | 获取声调、语速等配置。 |
| `getShotListByProjectId` | `/api/scriptShot/v1/shotListByProjectId` | 获取项目分镜列表。 |
| `addText2imageTask` | `/api/text2image/v1/mj/text2image/addTask` | 添加文生图任务。 |
| `postSaveImage` | `/api/text2image/v1/image/resource/save` | 保存图片资源。 |
| `generateImagePrompt` | `/api/prompt/v1/generateImage/parse` | 解析图片生成 Prompt。 |
| `getResourceList` | `/api/resource/v1/page` | 查询资源分页。 |
| `delResourceItem` | `/api/resource/v1/delete` | 删除资源。 |
| `addResource` | `/api/resource/v1/add` | 添加资源。 |
| `reinstateTask` | `/api/queue/v1/task/reinstateTask` | 重新生成任务。 |
| `getText2imageHistories` | `/api/resource/v1/mj/image/history` | 获取图片任务历史。 |
| `getVideoHistories` | `/api/resource/v1/svd/video/history` | 获取视频任务历史。 |
| `getAudioHistories` | `/api/resource/v1/tts/voice/history` | 获取音频任务历史。 |
| `addVideoTask` | `/api/image2video/v1/svd/generateVideo/addTask` | 添加图生视频任务。 |
| `addAudioTask` | `/api/tts/v1/genVoices` | 添加 TTS 任务。 |
| `confirmResource` | `/api/resource/v1/confirm` | 确认终选资源。 |
| `getVideoDetail` | `/api/resource/v1/final/video/detail` | 查询终选视频详情。 |
| `getVoiceDetail` | `/api/resource/v1/final/voice/detail` | 查询终选音频详情。 |
| `packageBatch` | `/api/scriptShot/v1/packageBatch` | 批量打包分镜。 |
| `importResourceFile` | `/api/resource/v1/import/voice/detail` | 导入资源文件。 |
| `saveShotList` | `/api/scriptShot/v1/saveShotList` | 保存分镜信息。 |
| `translateToEnglish` | `/api/prompt/v1/translate` | Prompt 英文翻译。 |
| `packageBatchItem` | `/api/scriptShot/v1/packageSingle/{shotId}` | 单个分镜打包。 |

## Common API

文件：`apps/web/src/api/models/common.ts`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getQiniuUploadToken` | `/api/qiniu/v1/upload-token` | 获取七牛云 uploadToken。 |
| `getPathConfig` | `/api/qiniu/v1/pathConfig` | 获取七牛云上传路径配置。 |

## Socket 通道

文件：`apps/web/src/const/socket.ts`

| 常量 | 通道 | 说明 |
| --- | --- | --- |
| `SEND_THOROUGH` | `/app/message` | 默认发送通道。 |
| `SCRIPT_SEND_THOROUGH` | `/app/ai/stream/session/chat` | 剧本聊天发送通道。 |
| `SCRIPT_SUBSCRIBE_THOROUGH` | `/user/queue/session/chat/reply` | 剧本聊天回复。 |
| `SCRIPT_END_SUBSCRIBE_THOROUGH` | `/user/queue/session/chat/reply/completed` | 剧本聊天完成。 |
| `SCRIPT_ADD_THOROUGH` | `/user/queue/save/script/reply` | 保存剧本结果。 |
| `TEXT_TO_IMAGE_THOROUGH` | `/user/queue/task/text2img` | 文生图任务通知。 |
| `IMAGE_TO_VIDEO_THOROUGH` | `/user/queue/task/img2video` | 图生视频任务通知。 |
| `TTS_THOROUGH` | `/user/queue/task/tts` | TTS 任务通知。 |
| `PACKAGE_DOWNLOAD_THOROUGH` | `/user/queue/shots/download` | 打包下载通知。 |

订阅时会追加 `/{accountId}`。
