# Nest 后端接口迁移清单

本文档记录当前前端接口到新 NestJS 后端的迁移关系。旧服务端不可用，所有仍在使用的接口必须由新后端真实承接；允许短期兼容旧路径名称，但不允许代理旧服务端。

## 迁移原则

| 项 | 约定 |
| --- | --- |
| 前端基础地址 | `VITE_API_SERVER` 指向新 NestJS 后端 HTTP 地址。 |
| Socket 地址 | `VITE_SOCKET_BASE` 指向新 NestJS 后端 STOMP 地址。 |
| SSE | 剧本/聊天 token 级流式输出保留 SSE。 |
| STOMP | 仅用于图片、视频、音频、打包下载、剧本完成等异步任务通知。 |
| 响应结构 | HTTP 成功响应保持 `{ code: 200, message, data }`。 |
| 登录失效 | 保持 `code: 30001`，兼容现有前端拦截器。 |
| 旧服务端 | 不代理、不兜底、不作为实现路径。 |

## Auth / Account

| 前端调用 | 旧路径 | 新后端路径 | 方法 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `login` | `/classroom-slides/auth/login` | `/classroom-slides/auth/login` | POST | `apps/web/src/api/models/auth.ts` | Nest `auth` 模块实现，短期兼容旧路径 | 待测 |
| `checkLogin` | `/classroom-slides/auth/check` | `/classroom-slides/auth/check` | POST | `apps/web/src/api/models/auth.ts` | Nest `auth` 模块实现，短期兼容旧路径 | 待测 |
| `logout` | `/classroom-slides/auth/logout` | `/classroom-slides/auth/logout` | POST | `apps/web/src/api/models/auth.ts` | Nest `auth` 模块实现，短期兼容旧路径 | 待测 |
| `getUerInfo` | `/api/account/userInfo/get` | `/api/account/userInfo/get` | GET | `apps/web/src/api/models/auth.ts` | Nest `account` 模块实现 | 待测 |

## Project

| 前端调用 | 旧路径 | 新后端路径 | 方法 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `projectList` | `/api/project/page` | `/api/project/page` | POST | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |
| `projectSave` | `/api/project/save` | `/api/project/save` | POST | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |
| `getProjectDetail` | `/api/project/detail` | `/api/project/detail` | GET | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |
| `getListSubjectName` | `/api/project/v1/listSubjectName` | `/api/project/v1/listSubjectName` | GET | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |
| `getListTermName` | `/api/project/v1/listTermName` | `/api/project/v1/listTermName` | GET | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |
| `delProjectList` | `/api/project/delete` | `/api/project/delete` | POST | `apps/web/src/api/models/project.ts` | Nest `project` 模块实现 | 待测 |

## Script / Session / Prompt

| 前端调用 | 旧路径 | 新后端路径 | 方法/协议 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `CHAT_URL` | `/api/text/v1/ai/stream/sessionChat` | `/api/text/v1/ai/stream/sessionChat` | POST SSE | `apps/web/src/api/models/aiScript.ts`, `apps/web/src/api/models/chat.ts` | Nest `script` + `llm` 模块实现，DeepSeek provider | 待测 |
| `CHAT_URL_AGAIN` | `/api/text/v1/ai/stream/resendMessage` | `/api/text/v1/ai/stream/resendMessage` | POST SSE | `apps/web/src/api/models/aiScript.ts`, `apps/web/src/api/models/chat.ts` | Nest `script` + `llm` 模块实现，DeepSeek provider | 待测 |
| `downloadTemplateUrl` | `/api/text/v1/downloadTemplate` | `/api/text/v1/downloadTemplate` | GET | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `createChat` | `/api/session/create` | `/api/session/create` | POST | `apps/web/src/api/models/aiScript.ts` | Nest `session` 模块实现 | 待测 |
| `getChatHistories` | `/api/session/chat/getHistories` | `/api/session/chat/getHistories` | POST | `apps/web/src/api/models/aiScript.ts` | Nest `session` 模块实现 | 待测 |
| `getScriptPrompt` | `/api/prompt/v1/generateShot/parse` | `/api/prompt/v1/generateShot/parse` | POST | `apps/web/src/api/models/aiScript.ts` | Nest `prompt` 模块实现 | 待测 |
| `getListScriptStyle` | `/api/text/v1/listScriptStyle` | `/api/text/v1/listScriptStyle` | GET | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `getListScripType` | `/api/text/v1/listScriptType` | `/api/text/v1/listScriptType` | GET | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `fileUpload` | `/api/file/v1/upload` | `/api/file/v1/upload` | POST multipart | `apps/web/src/api/models/aiScript.ts` | Nest `storage` 模块实现 | 待测 |
| `saveScript` | `/api/text/v2/saveScript` | `/api/text/v2/saveScript` | POST | `apps/web/src/api/models/aiScript.ts` | Nest `script` + `shot` 模块实现 | 待测 |
| `getPageScript` | `/api/text/v1/pageScript` | `/api/text/v1/pageScript` | POST | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `previewScript` | `/api/text/v1/previewScript` | `/api/text/v1/previewScript` | GET | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `uploadScript` | `/api/text/v1/importScript/{projectId}` | `/api/text/v1/importScript/{projectId}` | POST multipart | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `deleteScript` | `/api/text/v1/deleteScript` | `/api/text/v1/deleteScript` | DELETE | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| `confirmScript` | `/api/text/v1/confirmScript` | `/api/text/v1/confirmScript` | PUT | `apps/web/src/api/models/aiScript.ts` | Nest `script` 模块实现 | 待测 |
| downloadScript | `/api/text/v1/downloadScript` | `/api/text/v1/downloadScript` | GET | `MaterialItem`, `DownloadScript` | Nest `script` 模块实现 | 待测 |

## Generation / Resource / TTS

| 前端调用 | 旧路径 | 新后端路径 | 方法 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `getImagePromptBtnList` | `/api/prompt/v1/parseMJPrompt/btnList` | `/api/prompt/v1/parseMJPrompt/btnList` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `prompt` 模块实现 | 待测 |
| `addText2imageTask` | `/api/text2image/v1/mj/text2image/addTask` | `/api/text2image/v1/mj/text2image/addTask` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `generation` 模块，文生图 provider 配置后启用 | 待测 |
| `generateImagePrompt` | `/api/prompt/v1/generateImage/parse` | `/api/prompt/v1/generateImage/parse` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `prompt` 模块实现 | 待测 |
| `addVideoTask` | `/api/image2video/v1/svd/generateVideo/addTask` | `/api/image2video/v1/svd/generateVideo/addTask` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `generation` 模块，图生视频 provider 配置后启用 | 待测 |
| 文生视频任务 | 新增 | `/api/text2video/v1/generateVideo/addTask` | POST | 后续前端接入 | Nest `generation` 模块，腾讯文生视频 provider | 待测 |
| `addAudioTask` | `/api/tts/v1/genVoices` | `/api/tts/v1/genVoices` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `tts` 模块实现 | 待测 |
| `getAllLanguages` | `/api/tts/v1/languages` | `/api/tts/v1/languages` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `tts` 模块实现 | 待测 |
| `getVoices` | `/api/tts/v1/voices/{localeName}` | `/api/tts/v1/voices/{localeName}` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `tts` 模块实现 | 待测 |
| `getStyles` | `/api/tts/v1/styles/{voice}` | `/api/tts/v1/styles/{voice}` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `tts` 模块实现 | 待测 |
| `getOtherAudioConfig` | `/api/tts/v1/otherOptions` | `/api/tts/v1/otherOptions` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `tts` 模块实现 | 待测 |
| `getShotListByProjectId` | `/api/scriptShot/v1/shotListByProjectId` | `/api/scriptShot/v1/shotListByProjectId` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `shot` 模块实现 | 待测 |
| `saveShotList` | `/api/scriptShot/v1/saveShotList` | `/api/scriptShot/v1/saveShotList` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `shot` 模块实现 | 待测 |
| `packageBatch` | `/api/scriptShot/v1/packageBatch` | `/api/scriptShot/v1/packageBatch` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `shot` 模块实现 | 待测 |
| `packageBatchItem` | `/api/scriptShot/v1/packageSingle/{shotId}` | `/api/scriptShot/v1/packageSingle/{shotId}` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `shot` 模块实现 | 待测 |
| `postSaveImage` | `/api/text2image/v1/image/resource/save` | `/api/text2image/v1/image/resource/save` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `getResourceList` | `/api/resource/v1/page` | `/api/resource/v1/page` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `delResourceItem` | `/api/resource/v1/delete` | `/api/resource/v1/delete` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `addResource` | `/api/resource/v1/add` | `/api/resource/v1/add` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `confirmResource` | `/api/resource/v1/confirm` | `/api/resource/v1/confirm` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `getVideoDetail` | `/api/resource/v1/final/video/detail` | `/api/resource/v1/final/video/detail` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `getVoiceDetail` | `/api/resource/v1/final/voice/detail` | `/api/resource/v1/final/voice/detail` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `importResourceFile` | `/api/resource/v1/import/voice/detail` | `/api/resource/v1/import/voice/detail` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `reinstateTask` | `/api/queue/v1/task/reinstateTask` | `/api/queue/v1/task/reinstateTask` | POST | `apps/web/src/api/models/aiVideo.ts` | Nest `generation` 模块实现 | 待测 |
| `getText2imageHistories` | `/api/resource/v1/mj/image/history` | `/api/resource/v1/mj/image/history` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `getVideoHistories` | `/api/resource/v1/svd/video/history` | `/api/resource/v1/svd/video/history` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `getAudioHistories` | `/api/resource/v1/tts/voice/history` | `/api/resource/v1/tts/voice/history` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `resource` 模块实现 | 待测 |
| `translateToEnglish` | `/api/prompt/v1/translate` | `/api/prompt/v1/translate` | GET | `apps/web/src/api/models/aiVideo.ts` | Nest `prompt` + `llm` 模块实现 | 待测 |

## Storage / Upload

| 前端调用 | 旧路径 | 新后端路径 | 方法 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `getQiniuUploadToken` | `/api/qiniu/v1/upload-token` | `/api/qiniu/v1/upload-token` | GET | `apps/web/src/api/models/common.ts`, `App.tsx`, `CommonUpload` | Nest `storage` 模块生成七牛云 uploadToken | 待测 |
| `getPathConfig` | `/api/qiniu/v1/pathConfig` | `/api/qiniu/v1/pathConfig` | GET | `apps/web/src/api/models/common.ts` | Nest `storage` 模块实现 | 待测 |

## Realtime

| 常量/调用 | 旧通道 | 新通道 | 协议 | 调用位置 | 实现方式 | 测试状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `VITE_SOCKET_BASE` | 旧 `/api/ws` | 新 `/api/ws` | STOMP over SockJS | `useStompSocket` | Nest `notification` gateway | 待测 |
| `SCRIPT_SUBSCRIBE_THOROUGH` | `/user/queue/session/chat/reply` | `/user/queue/session/chat/reply` | STOMP | `Sctipt/index.tsx` | 仅完成/状态通知，token 流走 SSE | 待测 |
| `SCRIPT_END_SUBSCRIBE_THOROUGH` | `/user/queue/session/chat/reply/completed` | `/user/queue/session/chat/reply/completed` | STOMP | `Sctipt/index.tsx` | 剧本生成完成通知 | 待测 |
| `SCRIPT_ADD_THOROUGH` | `/user/queue/save/script/reply` | `/user/queue/save/script/reply` | STOMP | `Sctipt/index.tsx` | 剧本保存结果通知 | 待测 |
| `TEXT_TO_IMAGE_THOROUGH` | `/user/queue/task/text2img` | `/user/queue/task/text2img` | STOMP | `Video/index.tsx` | 文生图任务通知 | 待测 |
| `IMAGE_TO_VIDEO_THOROUGH` | `/user/queue/task/img2video` | `/user/queue/task/img2video` | STOMP | `Video/index.tsx` | 图生视频任务通知 | 待测 |
| `TTS_THOROUGH` | `/user/queue/task/tts` | `/user/queue/task/tts` | STOMP | `Video/index.tsx` | TTS 任务通知 | 待测 |
| `PACKAGE_DOWNLOAD_THOROUGH` | `/user/queue/shots/download` | `/user/queue/shots/download` | STOMP | `Video/index.tsx` | 打包下载通知 | 待测 |

## 环境变量迁移

| 变量 | 新含义 | 状态 |
| --- | --- | --- |
| `VITE_API_SERVER` | 新 NestJS 后端 HTTP 地址 | 待切换 |
| `VITE_SOCKET_BASE` | 新 NestJS 后端 STOMP/SockJS 地址 | 待切换 |
| `VITE_QINIU_BUCKET_NAME` | 前端上传使用的七牛云 bucket 名称，当前 `qiqi1234567` | 已切换 |
| `VITE_QINIU_PUBLIC_DOMAIN` | 七牛云公开访问域名或 CDN 域名 | 已切换 |
| `VITE_CDN_SERVER` | CDN 替换域名 | 保留 |
| `VITE_STORAGE_QINIU_KEY` | uploadToken 缓存 key | 已切换 |
| `VITE_STORAGE_QINIU_TIME` | uploadToken 缓存时间 key | 已切换 |
