# 项目总览

## 项目定位

`ai-content-platform` 是一个 AI 内容生产平台前端。它围绕“项目 -> 剧本 -> 分镜资源 -> 打包导出”的流程，帮助用户创建课程/内容项目，并通过 AI 辅助生成剧本、图片、音频和视频素材。

当前仓库是前端工程，不包含后端服务、数据库定义和模型服务实现。前端通过 HTTP、SSE/流式接口、STOMP WebSocket 与后端系统协作。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 构建工具 | Vite 5 |
| UI 框架 | React 18 |
| 类型系统 | TypeScript |
| UI 组件 | Ant Design 5 |
| 状态管理 | Rematch + Redux + Immer |
| 路由 | React Router 6，Hash Router |
| 样式 | Less、CSS Modules |
| 请求 | Axios、fetch-event-source |
| 实时消息 | SockJS + STOMP |
| 文件/七牛云 | 七牛云 uploadToken + 浏览器直传 |

## 主要能力

| 能力 | 入口 | 说明 |
| --- | --- | --- |
| 项目管理 | `/` | 展示“我的项目”，支持新建、分页、删除和进入编辑。 |
| 剧本设计 | `#/project/:id/script` | 根据项目和配置生成 Prompt，发起 AI 剧本对话，保存/导入/确认剧本。 |
| 镜头设计 | `#/project/:id/video` | 基于分镜生成图片、音频、视频，管理资源历史和终选资源。 |
| 打包导出 | 视频页右上角 | 后端打包所有分镜资源，前端收到 Socket 通知后从七牛云下载。 |

## 代码目录

| 路径 | 说明 |
| --- | --- |
| `apps/web/src/main.tsx` | 应用入口，挂载 Ant Design 配置和 Redux Provider。 |
| `apps/web/src/App.tsx` | 路由入口，并预取七牛云 uploadToken。 |
| `apps/web/src/router/index.tsx` | Hash 路由配置。 |
| `apps/web/src/api/` | Axios 实例、接口模块和接口类型。 |
| `apps/web/src/store/` | Rematch store 和业务状态模型。 |
| `apps/web/src/pages/Home/` | 首页布局。 |
| `apps/web/src/pages/AIProject/List/` | 项目列表、新建项目、删除项目。 |
| `apps/web/src/pages/AIProject/Main/Sctipt/` | 剧本设计页面。目录名当前拼写为 `Sctipt`。 |
| `apps/web/src/pages/AIProject/Main/Video/` | 镜头设计页面。 |
| `apps/web/src/components/` | 通用布局、上传、弹窗、图标、输入等组件。 |
| `apps/web/src/hooks/` | Socket、鉴权、缓存请求、滚动等 hooks。 |
| `apps/web/src/utils/` | Token、下载、七牛云、文本转换等工具。 |
| `apps/web/src/script/` | 构建后七牛云上传和发布配置。 |

## 系统边界

前端负责：

- 页面路由、表单、列表、聊天区、分镜资源交互。
- 调用后端接口创建项目、查询项目、生成 Prompt、发起任务、确认资源。
- 通过 WebSocket 接收 AI 生成、任务进度、打包下载等通知。
- 使用七牛云 uploadToken上传/下载资源。

后端负责：

- 用户鉴权和账号信息。
- 项目、会话、剧本、分镜、资源、任务等数据存储。
- Prompt 解析、AI 文本生成、文生图、图生视频、TTS 和打包任务。
- 向用户维度的 Socket 通道推送任务结果。

## 已知缺口

- 当前仓库未提交 `env` 目录，启动前需要补齐环境变量。
- 后端接口协议只在前端调用处体现，缺少正式 OpenAPI/Swagger 文档。
- 数据库表结构未包含在仓库中，本文档的数据模型基于前端类型和接口字段整理。
- `README.md` 原先是 Vite 模板说明，本次已替换为项目入口说明。
