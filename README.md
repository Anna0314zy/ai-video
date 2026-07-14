# AI Content Platform

AI Content Platform 是一个面向 AI 内容生产流程的轻量 monorepo 项目，包含 Vite React 前端和 NestJS 后端。

当前代码主要覆盖三条工作流：

- 我的项目：项目列表、新建项目、删除项目、按项目状态进入编辑流程。
- 剧本设计：基于项目配置生成剧本 Prompt，发起 AI 对话，保存、导入、预览、确认剧本。
- 镜头设计：按分镜生成图片、音频、视频资源，确认终选资源，并打包导出。

## 快速开始

```bash
pnpm install
pnpm --filter @ai-video/server db:generate
pnpm --filter @ai-video/server db:push
pnpm run dev:web
pnpm run dev:server
```

前端默认开发端口是 `5155`，配置位于 `apps/web/vite.config.ts`。后端默认端口是 `4000`，配置位于 `apps/server/.env.example`。
服务端 Swagger 测试入口是 `http://localhost:4000/api-docs`。

## 常用命令

```bash
pnpm run dev:web
pnpm run dev:server
pnpm run build:web
pnpm run build:server
pnpm --filter @ai-video/server db:studio
pnpm run lint:web
pnpm run preview
```

## 技术文档

完整技术文档从这里开始：

- [项目总览](docs/00-overview.md)
- [本地启动与开发环境](docs/01-quickstart.md)
- [系统架构](docs/02-architecture.md)
- [核心业务流程](docs/03-business-flow.md)
- [模块说明](docs/04-modules.md)
- [数据模型](docs/05-data-model.md)
- [接口说明](docs/06-api.md)
- [AI 工作流](docs/07-ai-workflow.md)
- [部署与发布](docs/08-deployment.md)
- [常见问题与排障](docs/09-troubleshooting.md)

## 维护建议

修改接口、路由、环境变量、核心状态模型、AI 生成链路、上传下载链路时，请同步更新 `docs/` 下对应文档。
