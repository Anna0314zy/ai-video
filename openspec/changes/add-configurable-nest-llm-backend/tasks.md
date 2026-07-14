## 1. 接口盘点与迁移设计

- [x] 1.1 盘点 `apps/web/src/api/models/auth.ts`、`common.ts`、`project.ts`、`aiScript.ts`、`aiVideo.ts` 和 `chat.ts` 的全部接口函数。
- [x] 1.2 盘点下载直链、硬编码聊天地址、SSE 地址、七牛云环境变量、WebSocket/STOMP 地址和订阅主题。
- [x] 1.3 建立接口迁移清单，记录旧路径、新路径、方法或协议、请求参数、响应结构、调用位置、新后端实现方式和测试状态。
- [x] 1.4 明确所有仍在使用的接口必须由新 Nest 后端实现，不允许代理旧服务端。

## 2. NestJS 后端基础工程

- [x] 2.1 确定后端工作区位置并新增 NestJS 应用结构。
- [x] 2.2 添加 NestJS、配置加载、配置校验、HTTP 调用、文件上传、SSE、WebSocket/STOMP、测试相关依赖。
- [x] 2.3 添加本地开发、构建、lint、单元测试和 e2e 测试脚本。
- [x] 2.4 实现统一配置模块，覆盖服务端端口、鉴权、七牛云、LLM、生成服务、超时和重试配置。
- [x] 2.5 添加 `.env.example`，说明所有必需配置且不包含真实密钥。
- [x] 2.6 添加 Prisma 数据库 schema、本地 SQLite `DATABASE_URL` 示例和数据库初始化脚本。
- [x] 2.7 添加 Swagger 接口文档入口 `/api-docs`，用于浏览器测试接口。
- [x] 2.8 为主要 HTTP 接口补充 Swagger DTO、query/path/body 参数示例。

## 3. 通用后端能力

- [x] 3.1 实现统一响应结构，兼容前端当前 `code`、`message`、`data` 拦截逻辑。
- [x] 3.2 实现统一错误过滤器，覆盖参数错误、登录失效、上游鉴权失败、上游超时、上游限流和未知错误。
- [x] 3.3 实现鉴权 guard 或 middleware，兼容当前 token 传递方式。
- [x] 3.4 实现请求 DTO 校验和全局 validation pipe。
- [ ] 3.5 添加通用能力的单元测试和 e2e 测试。

## 4. 配置化大模型能力

- [x] 4.1 定义 provider-neutral 的 LLM 请求、响应、metadata 和错误契约。
- [x] 4.2 实现共享 `LlmProvider` interface。
- [x] 4.3 实现根据配置创建当前 provider adapter 的 provider factory。
- [ ] 4.4 实现 DeepSeek OpenAI-compatible provider adapter，使用配置的 base URL、API key、model、timeout 和 retry。
- [x] 4.5 将剧本流式生成默认配置为 DeepSeek provider，并通过 `LLM_SCRIPT_MODEL` 指定模型。
- [x] 4.6 在 `.env.example` 中提供 `LLM_SCRIPT_MODEL=deepseek-chat` 示例，并支持通过配置切换到 `deepseek-reasoner` 或其他兼容模型。
- [ ] 4.7 添加 provider 选择、unsupported provider、成功响应映射、错误映射和模型切换测试。

## 5. 认证、用户与项目接口

- [x] 5.1 实现登录、登录校验、登出和用户信息接口。
- [x] 5.2 实现项目分页、新建项目、项目详情、学科列表、学期列表和项目删除接口。
- [x] 5.3 保持响应结构兼容当前前端类型和拦截器。
- [x] 5.4 将项目列表、新建、详情和删除接口接入数据库持久化。
- [x] 5.5 将登录改为用户表用户名/密码校验并签发 JWT。
- [x] 5.6 将前端登录入口切换为用户名/密码并保存 JWT。
- [ ] 5.7 添加认证、用户和项目接口测试。

## 6. 剧本、会话与提示词接口

- [x] 6.1 实现创建会话和会话历史接口。
- [x] 6.2 实现剧本 prompt 解析、剧本风格列表、剧本类型列表接口。
- [x] 6.3 实现剧本保存、剧本分页、剧本预览、剧本导入、剧本删除、剧本确认和剧本下载接口。
- [x] 6.4 实现兼容前端 `fetchEventSource` 的 SSE 剧本/聊天生成接口，并保持 token 级增量输出走 SSE。
- [x] 6.5 实现重新生成消息的 SSE 接口。
- [x] 6.6 确保 STOMP 只发送剧本完成或保存完成通知，不承接 token 流输出。
- [x] 6.7 将会话创建、会话历史、剧本保存和剧本分页接口接入数据库持久化。
- [ ] 6.8 添加剧本、会话、提示词和 SSE 流式接口测试。

## 7. 分镜、生成与资源接口

- [x] 7.1 实现分镜列表、分镜保存、批量打包和单个分镜打包接口。
- [x] 7.2 实现生成服务 provider contract，分别覆盖文生图、文生视频和图生视频。
- [x] 7.3 实现腾讯文生视频 provider adapter 和文生视频任务创建接口。
- [x] 7.4 为文生图 provider 预留独立配置和 adapter，并在 provider 未配置时返回明确功能未配置错误。
- [x] 7.5 为图生视频 provider 预留独立配置和 adapter，并在 provider 未配置时返回明确功能未配置错误。
- [x] 7.6 实现文生图 prompt 按钮列表、图片 prompt 解析、创建文生图任务和图片资源保存接口。
- [x] 7.7 实现图生视频任务创建和视频历史接口。
- [x] 7.8 实现 TTS 语言、声音、风格、其他音频参数、音频任务创建和音频历史接口。
- [x] 7.9 实现资源分页、资源删除、资源添加、资源确认、终选视频详情、终选音频详情和资源导入接口。
- [x] 7.10 实现任务重试接口。
- [ ] 7.11 添加分镜、生成任务、provider 未配置和资源接口测试。

## 8. 存储、上传与实时通知

- [x] 8.1 实现文件上传接口，兼容当前 `fileId` 和 `fileName` 返回结构。
- [x] 8.2 实现七牛云 uploadToken 和路径配置接口，避免向前端暴露长期密钥。
- [x] 8.2.1 将前端上传、预览、下载和发布脚本从旧对象存储切换为七牛云。
- [ ] 8.3 实现 WebSocket/STOMP 网关，兼容当前前端订阅主题和用户维度推送。
- [ ] 8.4 实现图片、视频、音频、打包下载、剧本生成完成和剧本保存完成通知。
- [ ] 8.5 添加上传、七牛云和 STOMP 通知测试。

## 9. 前端接口切换

- [x] 9.1 将 `apps/web/src/api/models/*` 中所有接口地址切换到新的 NestJS 后端配置。
- [x] 9.2 将 `apps/web/src/api/models/chat.ts` 的 SSE 地址切换到新后端。
- [x] 9.3 将剧本下载直链切换到新后端，并保持鉴权处理。
- [x] 9.4 将 `VITE_SOCKET_BASE` 指向新后端 WebSocket/STOMP 地址。
- [x] 9.5 移除前端代码中的旧服务端硬编码域名和硬编码聊天地址。
- [ ] 9.6 验证前端主要页面调用新后端接口时不需要感知 provider 或第三方服务细节。

## 10. 文档与验收

- [x] 10.1 文档化 Nest 后端本地启动方式。
- [x] 10.2 文档化接口迁移清单和每个接口域的验收方式。
- [x] 10.3 文档化如何通过配置切换大模型 provider 和 model。
- [x] 10.4 文档化如何新增 provider adapter。
- [ ] 10.5 运行后端 build、lint、单元测试和 e2e 测试。
- [ ] 10.6 运行前端类型检查、构建或现有验证命令。
- [x] 10.7 运行 OpenSpec validation/status 检查。
