## 背景

当前项目主要是前端应用，接口集中在 `apps/web/src/api/models/*`，并通过 `VITE_API_SERVER`、`VITE_SOCKET_BASE`、七牛云环境变量和少量硬编码地址连接旧服务端。已识别的接口域包括认证、用户信息、项目管理、剧本生成与管理、会话历史、SSE 流式聊天、分镜、文生图、文生视频、图生视频、TTS、资源管理、资源导入/确认/删除、下载、七牛云 uploadToken和 STOMP 任务通知。

新的服务端需要使用 NestJS。它不只是大模型调用层，还要成为前端统一 API 层，承接当前所有接口，并把大模型、图片/视频/音频生成、存储和通知等外部依赖封装在服务端内部。

旧服务端不可继续使用，因此新后端必须真实承接服务端能力；迁移阶段可以兼容旧路径名称，但不能把请求代理回旧服务端。

## 目标与非目标

**目标：**

- 新增 NestJS 后端应用，统一承接当前前端所有 HTTP、SSE 和 WebSocket/STOMP 接口。
- 为现有前端接口建立迁移清单，保证每个仍在使用的接口都有新后端实现或明确废弃说明。
- 将大模型 provider、模型名称、base URL、API key、超时、重试和 provider 扩展参数做成配置。
- 通过 provider adapter 抽象大模型和外部生成服务，后期换模型或服务时尽量不改前端。
- 统一鉴权、请求校验、响应结构、错误码、日志和敏感信息保护。
- 支持前端现有的 SSE 流式输出和 STOMP 任务通知使用方式。
- 提供测试和文档，覆盖接口重接、配置切换、错误归一化和实时通信。

**非目标：**

- 不在本变更中重新设计前端页面交互。
- 不一次性实现所有可能的大模型或生成服务厂商；先实现已确认的 provider adapter，并保留扩展点。
- 不把 provider API key、七牛云密钥或其他敏感信息提交到仓库。
- 不新增用户计费、额度管理、多租户路由或后台管理系统，除非当前接口迁移必须依赖。

## 技术决策

1. 使用 NestJS 作为统一后端/BFF。

   Nest 的 module、controller、service、guard、interceptor 和 provider 注入机制适合把现有接口按业务域拆开，同时能把大模型、资源、通知等外部依赖封装在服务端。相比继续让前端直连旧接口，统一后端能降低后续替换模型和生成服务的成本。

2. 按业务域拆分后端模块。

   建议模块包括 `auth`、`account`、`project`、`script`、`session`、`prompt`、`shot`、`resource`、`generation`、`tts`、`storage`、`notification`、`llm` 和 `common`。每个模块负责自己的 DTO、controller、service 和测试，避免所有接口堆在一个大 controller 中。

3. 建立接口迁移清单。

   实现前先从 `apps/web/src/api/models/*`、下载直链、`fetchEventSource`、`useStompSocket` 和环境变量中提取接口清单。每个接口记录旧路径、新路径、方法、请求参数、响应结构、调用页面、迁移方式和测试状态。

4. 第一阶段兼容前端调用形态，但不代理旧服务端。

   为降低前端改造风险，Nest 可以先提供与旧接口相同的路径，或提供清晰的新路径并在前端 API 层集中映射。推荐先保持前端 API model 的函数名稳定，内部 URL 切到新后端；后续再清理旧命名。由于旧服务端不可用，新后端不得把请求代理回旧服务端。

5. 大模型和生成服务通过 adapter 接入。

   `llm` 模块提供统一 provider interface。剧本流式输出的初始 provider 使用 DeepSeek 的 OpenAI-compatible HTTP 协议，默认模型通过 `LLM_SCRIPT_MODEL` 配置，`.env.example` 可先给出 `deepseek-chat` 示例；如果剧本质量要求高于速度和成本，可通过配置切换为 `deepseek-reasoner` 或 DeepSeek 官方后续推荐模型。图片、视频、TTS 等生成服务也应通过服务层隔离第三方调用，避免 controller 直接依赖外部 SDK 或 HTTP 细节。

6. 剧本流式输出保留 SSE，任务通知使用 STOMP。

   建议剧本/聊天生成继续通过 SSE 输出，因为它是单请求单响应流，天然适合 token 增量输出，也兼容当前前端 `fetchEventSource`。图片、视频、TTS、打包下载、剧本保存完成等异步任务状态继续通过 WebSocket/STOMP 主题推送；STOMP 不承接 token 级文本流，避免把请求响应流和后台任务通知混在同一通道。

7. 统一响应和错误处理。

   后端返回结构需要兼容当前前端拦截器期望的 `code`、`message`、`data` 结构，至少在迁移期保持 `200` 成功和 `30001` 登录失效语义。provider 错误、存储错误、生成任务错误和参数错误需要映射为稳定错误码，不能向前端暴露密钥或原始敏感信息。

8. 使用用户表和 JWT 承接本地登录。

   认证接口改为前端提交用户名和密码，用户名不存在时后端使用本次密码创建用户，用户名已存在时从 `User` 表读取用户并校验密码哈希，登录成功后签发 JWT。后续受保护接口通过 `Authorization` 请求头携带 JWT，服务端 guard 验证 token 并把当前用户挂到请求上下文。本地开发也走同一套真实登录流程，不使用本地默认 token 或固定默认账号，并配置强 `JWT_SECRET`。

9. 使用 Prisma 管理数据库访问。

   新后端需要持久化项目、会话、消息、剧本、分镜、资源、生成任务和文件资产等核心数据。第一阶段本地开发默认使用 SQLite，降低启动成本；业务代码通过 Prisma service 访问数据库，后续切换 PostgreSQL 时优先调整 datasource、环境变量和迁移脚本，不让 controller 感知数据库差异。

10. 提供 Swagger 接口文档。

   Nest 后端启动时挂载 `/api-docs`，用于浏览器查看和测试接口。Swagger 是开发联调入口，不替代 e2e 测试；鉴权接口通过 bearer auth 在页面中填写 token。

11. 生成服务 provider 决策。

   剧本流式输出：初始 provider 为 DeepSeek，模型名称通过 `LLM_SCRIPT_MODEL` 配置；默认示例使用 `deepseek-chat`，可配置切换 `deepseek-reasoner` 或后续官方推荐模型。

   文生视频：初始 provider 使用腾讯视频生成服务，并通过 `generation` adapter 封装任务创建、查询、回调或轮询。

   文生图：当前未最终确定 provider，后端必须设计为可配置 adapter。建议优先评估腾讯混元生图以保持腾讯生态一致；如果效果、成本或接口稳定性不满足要求，再评估阿里通义万相或火山即梦等备选。

   图生视频：当前未最终确定 provider。建议优先评估腾讯视频生成能力是否同时满足图生视频；如果不满足，新增独立 `image-to-video` provider adapter，不要把图生视频逻辑写死在文生视频 adapter 中。

## 风险与取舍

- 全量接口重接范围较大 -> 先做接口清单和模块拆分，按认证/项目/剧本/资源/生成/通知分阶段验收。
- 旧接口语义不完整或缺少后端文档 -> 以现有前端调用和类型为第一手契约，由新后端重新实现对应能力。
- 兼容旧路径会保留历史包袱 -> 可以短期兼容路径名称，但实现必须在新后端内完成，后续统一收敛路径和命名。
- SSE/STOMP 行为容易出现边界差异 -> 针对流式输出、断开、重连、任务完成、失败通知添加 e2e 测试。
- provider 或第三方生成服务差异较大 -> 把差异限制在 adapter/service 内，controller 只处理项目级 DTO。
- 配置错误会导致核心能力不可用 -> 启动时校验必填配置，并提供 `.env.example` 和本地启动文档。

## 迁移计划

1. 生成接口迁移清单，覆盖 `auth`、`common`、`project`、`aiScript`、`aiVideo`、`chat`、下载直链、七牛云和 STOMP。
2. 初始化 NestJS 后端应用和基础工程能力，包括配置、日志、鉴权、响应封装、错误过滤器和测试框架。
3. 实现配置化 LLM provider 模块和 DeepSeek OpenAI-compatible adapter，默认剧本模型通过 `LLM_SCRIPT_MODEL` 配置，`.env.example` 示例使用 `deepseek-chat`。
4. 实现腾讯文生视频 provider adapter，并为文生图、图生视频预留独立 provider 配置和 adapter contract。
5. 按业务域实现 HTTP API，并保持当前前端拦截器可识别的响应结构。
6. 实现 SSE 流式聊天接口和 STOMP 通知网关。
7. 将前端 API 层、SSE 地址、下载地址、Socket 地址和环境变量切到新 Nest 后端。
8. 为每个接口域补充单元测试、集成测试或 e2e 测试。
9. 文档化本地启动、环境变量、接口迁移表、模型切换和新增 adapter 流程。

回滚策略：由于旧服务端不可用，回滚不能依赖旧服务代理。若新后端某个接口未完成，只能回滚到上一版可用的新后端实现，或临时关闭对应前端功能入口并展示明确错误。

## 待确认问题

- 文生图 provider 最终选择腾讯混元生图、阿里通义万相、火山即梦，还是其他服务？
- 图生视频 provider 是否使用腾讯同一套视频生成服务，还是选择独立 provider？
