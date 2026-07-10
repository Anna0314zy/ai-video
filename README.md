# AI Content Platform

AI Content Platform 是一个面向 AI 内容生产流程的前端项目，基于 Vite、React、TypeScript、Ant Design 和 Rematch 构建。

当前代码主要覆盖三条工作流：

- 我的项目：项目列表、新建项目、删除项目、按项目状态进入编辑流程。
- 剧本设计：基于项目配置生成剧本 Prompt，发起 AI 对话，保存、导入、预览、确认剧本。
- 镜头设计：按分镜生成图片、音频、视频资源，确认终选资源，并打包导出。

## 快速开始

```bash
pnpm install
pnpm run dev
```

默认开发端口是 `5155`，由 `vite.config.ts` 固定配置。项目使用 `env` 目录读取环境变量，但当前仓库未提交环境文件，首次启动前需要补齐对应环境配置。

## 常用命令

```bash
pnpm run dev
pnpm run build:test
pnpm run build:prod
pnpm run lint
pnpm run preview
pnpm run release:test
pnpm run release:prod
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
