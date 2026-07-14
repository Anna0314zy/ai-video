## ADDED Requirements

### Requirement: NestJS 统一后端应用
系统 SHALL 提供一个基于 NestJS 的后端应用，作为当前前端所有服务端接口的统一对接层。

#### Scenario: 后端配置完整时启动成功
- **WHEN** 必需的后端配置、鉴权配置、存储配置和大模型配置均存在且合法
- **THEN** NestJS 应用 MUST 成功启动并暴露配置的 HTTP、SSE 和 WebSocket/STOMP 路由

#### Scenario: 必需配置缺失时启动失败
- **WHEN** 必需配置缺失、格式错误或 provider 不受支持
- **THEN** NestJS 应用 MUST 启动失败并给出清晰的配置错误

### Requirement: 全量前端接口迁移清单
系统 SHALL 为当前前端使用的所有接口建立迁移清单，并标明每个接口的新后端处理方式；旧服务端不可用，因此迁移清单 MUST NOT 把代理旧服务端作为实现方式。

#### Scenario: 接口清单覆盖前端 API model
- **WHEN** 开发者检查接口迁移清单
- **THEN** 清单 MUST 覆盖 `apps/web/src/api/models/auth.ts`、`common.ts`、`project.ts`、`aiScript.ts`、`aiVideo.ts` 和 `chat.ts` 中的所有接口函数

#### Scenario: 接口清单覆盖非 API model 调用
- **WHEN** 开发者检查接口迁移清单
- **THEN** 清单 MUST 覆盖下载直链、硬编码聊天地址、SSE 地址、七牛云环境变量依赖和 WebSocket/STOMP 地址

#### Scenario: 每个接口都有迁移状态
- **WHEN** 任意一个旧接口被列入迁移清单
- **THEN** 清单 MUST 标明旧路径、新路径、HTTP 方法或通信协议、请求参数、响应结构、调用位置、新后端实现方式和测试状态

#### Scenario: 不允许代理旧服务端
- **WHEN** 开发者检查接口迁移清单或后端实现
- **THEN** 任意仍在使用的接口 MUST 由新 NestJS 后端实现，并且 MUST NOT 代理到旧服务端

### Requirement: 认证与用户接口重接
系统 SHALL 在 NestJS 后端中承接登录、登录校验、登出和用户信息接口。

#### Scenario: 登录成功
- **WHEN** 前端提交用户表中已存在用户的正确用户名和密码
- **THEN** 后端 MUST 校验密码哈希并返回当前前端可识别的登录响应数据和 JWT token 信息

#### Scenario: 首次登录自动注册
- **WHEN** 前端提交用户表中不存在的用户名和密码
- **THEN** 后端 MUST 创建用户、保存密码哈希并返回当前前端可识别的登录响应数据和 JWT token 信息

#### Scenario: 受保护接口使用 JWT
- **WHEN** 前端访问登录以外的受保护接口
- **THEN** 后端 MUST 校验 `Authorization` 请求头中的 JWT，并从 token 识别当前用户

#### Scenario: 登录失效
- **WHEN** 请求 token 过期或无效
- **THEN** 后端 MUST 返回前端拦截器可识别的登录失效错误码

### Requirement: 项目与剧本接口重接
系统 SHALL 在 NestJS 后端中承接项目管理、会话历史、剧本生成、剧本保存、剧本分页、剧本预览、剧本导入、剧本删除、剧本确认和剧本下载接口。

#### Scenario: 项目列表查询
- **WHEN** 前端请求项目分页列表
- **THEN** 后端 MUST 返回兼容当前 `PageList<ProjectList>` 结构的数据

#### Scenario: 剧本保存
- **WHEN** 前端提交项目、会话和聊天消息信息保存剧本
- **THEN** 后端 MUST 保存剧本并返回兼容当前 `ScriptPageList` 结构的数据

#### Scenario: 剧本下载
- **WHEN** 前端通过新后端请求剧本下载
- **THEN** 后端 MUST 返回可下载文件，并保持 token 校验和错误处理一致

### Requirement: 生成与资源接口重接
系统 SHALL 在 NestJS 后端中承接分镜、文生图、文生视频、图生视频、TTS、资源列表、资源历史、资源确认、资源删除、资源导入和任务重试接口。

#### Scenario: 创建文生图任务
- **WHEN** 前端提交文生图任务参数
- **THEN** 后端 MUST 通过配置的文生图 provider 创建任务并返回兼容当前 `ChatMessageList` 结构的数据

#### Scenario: 创建文生视频任务
- **WHEN** 前端提交文生视频任务参数
- **THEN** 后端 MUST 通过腾讯文生视频 provider 创建任务并返回任务状态信息

#### Scenario: 创建图生视频任务
- **WHEN** 前端提交图生视频任务参数
- **THEN** 后端 MUST 通过配置的图生视频 provider 创建任务并返回任务状态信息

#### Scenario: 创建 TTS 任务
- **WHEN** 前端提交音频生成参数
- **THEN** 后端 MUST 创建 TTS 任务并返回兼容当前前端的数据结构

#### Scenario: 资源确认
- **WHEN** 前端确认某个分镜使用指定资源
- **THEN** 后端 MUST 保存资源确认结果并返回统一响应结构

### Requirement: 存储与上传接口重接
系统 SHALL 在 NestJS 后端中承接文件上传、七牛云 uploadToken、七牛云路径配置和资源导入相关接口。

#### Scenario: 获取七牛云 uploadToken
- **WHEN** 前端请求七牛云 uploadToken
- **THEN** 后端 MUST 返回前端上传组件可使用的 uploadToken，并且 MUST NOT 暴露长期密钥

#### Scenario: 文件上传
- **WHEN** 前端通过 multipart/form-data 上传文件
- **THEN** 后端 MUST 接收文件并返回兼容当前 `fileId` 和 `fileName` 字段的数据

### Requirement: 配置化大模型 provider
系统 SHALL 从配置中选择当前激活的大模型 provider 和模型，而不是在业务代码中硬编码。

#### Scenario: provider 从配置加载
- **WHEN** 后端启动时配置了 active provider、base URL、API key、model、timeout 和 retry
- **THEN** 后端 MUST 使用这些配置创建对应 provider adapter

#### Scenario: 剧本流式默认使用 DeepSeek
- **WHEN** 后端使用默认剧本流式生成配置启动
- **THEN** 后端 MUST 使用 DeepSeek provider 和 `LLM_SCRIPT_MODEL` 配置的模型处理剧本流式输出

#### Scenario: 通过配置更换模型
- **WHEN** 运维修改模型名称或 provider 配置并重启后端
- **THEN** 后续大模型请求 MUST 使用新的模型或 provider，且前端代码不需要修改

#### Scenario: 切换到高质量剧本模型
- **WHEN** 运维把剧本生成模型配置为 `deepseek-reasoner` 或 DeepSeek 官方后续推荐模型并重启后端
- **THEN** 后续剧本流式生成请求 MUST 使用新配置的模型，且前端代码不需要修改

### Requirement: Provider 抽象
系统 SHALL 通过 provider-neutral interface 调用大模型或生成服务，避免 controller 直接依赖具体厂商协议。

#### Scenario: AI 请求通过 provider interface
- **WHEN** 前端发送有效的 AI 生成请求
- **THEN** controller MUST 通过共享 provider interface 调用当前激活 adapter

#### Scenario: 配置了不支持的 provider
- **WHEN** 配置中的 provider 没有注册 adapter
- **THEN** 后端 MUST 拒绝启动并输出清晰的不支持 provider 错误

### Requirement: SSE 流式聊天接口
系统 SHALL 提供兼容前端 `fetchEventSource` 使用方式的 SSE 流式聊天接口；剧本 token 级增量输出 SHALL 保留 SSE，不迁移到 STOMP/WebSocket。

#### Scenario: 流式返回生成内容
- **WHEN** 前端发起剧本或聊天生成请求
- **THEN** 后端 MUST 按流式事件持续返回增量内容，直到生成完成或失败

#### Scenario: 重新生成消息
- **WHEN** 前端请求重新生成指定会话消息
- **THEN** 后端 MUST 使用对应会话上下文重新生成内容并通过 SSE 返回

#### Scenario: SSE 与 STOMP 职责分离
- **WHEN** 剧本生成需要 token 级增量输出
- **THEN** 后端 MUST 通过 SSE 返回增量内容，并且 MUST NOT 使用 STOMP 作为 token 流输出通道

### Requirement: WebSocket/STOMP 任务通知
系统 SHALL 提供兼容当前前端订阅方式的 WebSocket/STOMP 通知能力；STOMP SHALL 用于异步任务状态和完成通知，不用于剧本文本 token 流。

#### Scenario: 任务状态通知
- **WHEN** 图片、视频、音频或打包下载任务状态变化
- **THEN** 后端 MUST 向对应用户主题推送兼容当前前端的数据结构

#### Scenario: 剧本生成完成通知
- **WHEN** 剧本生成或保存流程完成
- **THEN** 后端 MUST 向当前前端订阅的完成主题推送完成消息

### Requirement: 多模态生成 provider 配置
系统 SHALL 将文生图、文生视频和图生视频 provider 做成独立配置，避免把不同生成能力写死在同一个实现中。

#### Scenario: 文生视频使用腾讯 provider
- **WHEN** 后端使用默认文生视频配置启动
- **THEN** 后端 MUST 使用腾讯文生视频 provider 处理文生视频任务

#### Scenario: 文生图 provider 未配置
- **WHEN** 前端请求文生图任务但文生图 provider 尚未配置
- **THEN** 后端 MUST 返回明确的功能未配置错误，而不是调用旧服务端或返回不明错误

#### Scenario: 图生视频 provider 未配置
- **WHEN** 前端请求图生视频任务但图生视频 provider 尚未配置
- **THEN** 后端 MUST 返回明确的功能未配置错误，而不是调用旧服务端或返回不明错误

### Requirement: 统一响应与错误处理
系统 SHALL 返回前端可识别的统一响应结构，并把服务端、provider 和第三方服务错误映射为稳定错误码。

#### Scenario: 成功响应
- **WHEN** 任意 HTTP API 请求成功
- **THEN** 后端 MUST 返回包含 `code`、`message` 和 `data` 的响应结构，并保持成功码与当前前端拦截器兼容

#### Scenario: 参数校验失败
- **WHEN** 前端请求参数不合法
- **THEN** 后端 MUST 返回统一参数校验错误，并且 MUST NOT 调用下游 provider 或第三方服务

#### Scenario: provider 鉴权失败
- **WHEN** 当前 provider 因凭证错误拒绝请求
- **THEN** 后端 MUST 返回归一化的上游鉴权错误，并且 MUST NOT 返回 API key 或包含敏感信息的原始错误

#### Scenario: provider 超时
- **WHEN** provider 请求超过配置的超时时间
- **THEN** 后端 MUST 返回归一化的上游超时错误

### Requirement: 前端切换到新后端
系统 SHALL 将前端所有接口地址、SSE 地址、下载地址和 WebSocket/STOMP 地址切换到新的 NestJS 后端。

#### Scenario: API model 指向新后端
- **WHEN** 前端运行在任意环境
- **THEN** `apps/web/src/api/models/*` 中的接口 MUST 使用新 NestJS 后端配置地址

#### Scenario: 移除硬编码旧服务地址
- **WHEN** 开发者搜索旧服务域名或硬编码聊天地址
- **THEN** 前端代码 MUST 不再包含直接调用旧服务端域名的接口地址

### Requirement: Provider 切换文档
系统 SHALL 文档化如何切换当前大模型 provider、如何新增 provider adapter，以及如何验证所有接口迁移完成。

#### Scenario: 运维切换 provider
- **WHEN** 运维按照文档修改受支持 provider 的配置
- **THEN** 后端 MUST 能在重启后使用新的 provider，且前端代码不需要修改

#### Scenario: 开发者新增 provider adapter
- **WHEN** 开发者按照文档新增 provider adapter
- **THEN** 新 adapter MUST 接入共享 provider interface，并包含成功和失败映射测试
