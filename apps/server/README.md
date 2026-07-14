# AI Content Platform Server

这是 AI Content Platform 的新 NestJS 后端，目标是承接前端全部服务端接口，并把大模型、生成服务、存储和实时通知封装在服务端内部。

## 本地启动

从仓库根目录安装依赖：

```bash
pnpm install
```

复制并填写环境变量：

```bash
cp apps/server/.env.example apps/server/.env
```

初始化本地数据库：

```bash
pnpm --filter @ai-video/server db:generate
pnpm --filter @ai-video/server db:push
```

可选：提前创建或重置一个可登录用户：

```bash
USERNAME=admin PASSWORD=your-password pnpm --filter @ai-video/server user:create
```

启动：

```bash
pnpm run dev:server
```

默认端口是 `4000`，前端开发环境已经指向 `http://localhost:4000`。

接口文档和在线测试入口：

```text
http://localhost:4000/api-docs
```

## 关键配置

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 数据库连接地址，当前本地默认 `file:./dev.db`。 |
| `JWT_SECRET` | JWT 签名密钥，本地和正式环境都必须配置。 |
| `JWT_EXPIRES_SECONDS` | JWT 有效期，单位秒。 |
| `LLM_PROVIDER` | 剧本流式生成的大模型 provider，当前默认 `deepseek`。 |
| `LLM_BASE_URL` | 大模型 OpenAI-compatible API 地址。 |
| `LLM_API_KEY` | 大模型 API key，只允许放在服务端。 |
| `LLM_SCRIPT_MODEL` | 剧本流式生成模型，示例值 `deepseek-chat`。 |
| `QINIU_BUCKET_NAME` | 七牛云 bucket，当前默认 `qiqi123456`。 |
| `QINIU_ACCESS_KEY` | 七牛云 AccessKey，只允许放在服务端。 |
| `QINIU_SECRET_KEY` | 七牛云 SecretKey，只允许放在服务端。 |
| `QINIU_PUBLIC_DOMAIN` | 七牛云公开访问域名或 CDN 域名。 |
| `QINIU_UPLOAD_HOST` | 七牛云上传域名，默认 `https://upload.qiniup.com`。 |
| `TEXT_TO_VIDEO_PROVIDER` | 文生视频 provider，当前默认 `tencent`。 |
| `TEXT_TO_IMAGE_PROVIDER` | 文生图 provider，未确认前可留空。 |
| `IMAGE_TO_VIDEO_PROVIDER` | 图生视频 provider，未确认前可留空。 |

## 七牛云存储

服务端通过 `/api/qiniu/v1/upload-token` 签发七牛云 uploadToken，前端拿到 token 后直传七牛云。长期密钥只放在服务端 `.env`，不会返回给浏览器。

本地默认 bucket 名称为 `qiqi123456`，你后续只需要在 `.env` 中补齐：

```bash
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_PUBLIC_DOMAIN=
```

## 数据库

当前服务端使用 Prisma 接数据库，本地开发默认 SQLite，方便直接启动和测试接口。

登录使用 `User` 表中的用户名和密码，本地开发也走真实登录流程。服务端不会接受本地默认 token，也不会创建固定默认账号。登录接口支持首次登录自动注册：当用户名不存在时，会使用本次提交的密码创建用户；用户名已存在时，会校验密码哈希。需要提前创建或重置用户时，可以执行 `user:create`。

已经接入真实数据库的接口包括：

- 项目分页、新建/更新、详情、删除。
- 会话创建、会话历史分页。
- 剧本保存、剧本分页。

常用命令：

```bash
pnpm --filter @ai-video/server db:generate
pnpm --filter @ai-video/server db:push
pnpm --filter @ai-video/server db:studio
```

后续要换 PostgreSQL 时，优先保留业务 service 不变，只调整 Prisma datasource、`DATABASE_URL` 和必要的迁移脚本。

## Swagger

Swagger UI 挂在 `/api-docs`，启动后可直接在浏览器里测试 HTTP 接口。需要鉴权的接口可以在 Swagger 页面右上角 `Authorize` 中填写 token。

主要接口已经补充 DTO 示例，Swagger 页面会展示 body、query 和 path 参数。

## Provider 扩展

新增大模型 provider：

1. 在 `src/llm/` 新增 provider class，实现 `LlmProvider`。
2. 在 `createLlmProvider` 中根据配置创建 provider。
3. 在 `.env.example` 中补充 provider 必需配置。
4. 增加成功响应、错误映射和模型切换测试。

新增生成服务 provider：

1. 在 `src/modules/generation/` 新增 provider class，实现 `GenerationProvider`。
2. 保持文生图、文生视频、图生视频使用独立 provider 配置。
3. provider 未配置时返回明确的“功能尚未配置”错误，不允许代理旧服务端。

## 实时通信边界

- 剧本 token 级流式输出使用 SSE。
- 图片、视频、音频、打包下载、剧本完成等异步任务通知使用 WebSocket/STOMP。
