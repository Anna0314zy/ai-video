# 模块说明

## 应用入口

| 文件 | 说明 |
| --- | --- |
| `src/main.tsx` | 创建 React Root，注入 Ant Design 中文语言包、主题和 Redux Provider。 |
| `src/App.tsx` | 预取 COS 临时凭证，渲染 RouterProvider。 |
| `src/theme.ts` | Ant Design 主题配置。 |

## 路由模块

`src/router/index.tsx` 使用 `createHashRouter`。

当前有效路由：

| 路径 | 组件 |
| --- | --- |
| `/` | `Home` |
| `/project/:id/script` | `CheckLogin(ScriptPage)` |
| `/project/:id/video` | `CheckLogin(VideoProcess)` |
| `*` | `NotFound` |

`CheckLogin` 当前逻辑是加载用户信息，加载完成后渲染目标页面。真正的 Token 缺失和过期处理主要依赖接口拦截器。

## 项目列表模块

| 文件 | 说明 |
| --- | --- |
| `src/pages/Home/index.tsx` | 首页布局，左侧菜单和右侧项目列表。 |
| `src/pages/AIProject/List/index.tsx` | 项目列表容器，负责分页查询和删除。 |
| `src/pages/AIProject/List/components/List.tsx` | 项目表格，按项目状态打开剧本或视频页。 |
| `src/pages/AIProject/List/components/ModalCreate.tsx` | 新建项目表单。 |
| `src/pages/AIProject/List/config.ts` | 年级、讲次、版本、项目类型等选项。 |

关键接口：

- `projectList`
- `projectSave`
- `delProjectList`
- `getListSubjectName`
- `getListTermName`

## 剧本模块

| 文件 | 说明 |
| --- | --- |
| `src/pages/AIProject/Main/Sctipt/index.tsx` | 剧本页主布局和 Socket 订阅。 |
| `Chat/ChatControl.tsx` | 剧本配置、Prompt 应用、消息发送、附件上传。 |
| `Chat/ChatContent.tsx` | 聊天历史展示。 |
| `Chat/components/ChatConfig.tsx` | 剧本类型、风格、时长、镜头数、字数等配置。 |
| `RightPanel/index.tsx` | 剧本资源列表、模板下载、导入剧本、确认剧本。 |
| `RightPanel/ScriptText/index.tsx` | 剧本卡片/文本列表展示。 |

关键状态：

- `currentProjectDetail`
- `currentSessionId`
- `messageListMap`
- `scriptPageListMap`
- `chatIng`

关键接口：

- `getProjectDetail`
- `createChat`
- `getScriptPrompt`
- `getChatHistories`
- `getPageScript`
- `saveScript`
- `previewScript`
- `uploadScript`
- `confirmScript`
- `deleteScript`

## 镜头/视频模块

| 文件 | 说明 |
| --- | --- |
| `src/pages/AIProject/Main/Video/index.tsx` | 镜头页主布局，加载分镜和订阅任务通知。 |
| `StoryboardLayoutLeft/` | 分镜列表和右键操作。 |
| `StoryboardLayoutMain/` | 图片、音频、视频生成配置和消息区。 |
| `StoryboardLayoutRight/` | 资源面板、结果面板、预览弹窗。 |
| `modules/StoryboardAudio/` | 音频资源管理。 |
| `modules/StoryboardVideo/` | 视频资源管理。 |
| `modules/Result/` | 结果展示。 |

关键状态：

- `shotList`
- `currentShotId`
- `selectedShot`
- `currentSelectType`
- `messageListMap.image`
- `messageListMap.video`
- `messageListMap.voice`
- `selectedImage`
- `selectedVideo`
- `selectedAudio`

关键接口：

- `getShotListByProjectId`
- `getResourceList`
- `getText2imageHistories`
- `getVideoHistories`
- `getAudioHistories`
- `addText2imageTask`
- `addVideoTask`
- `addAudioTask`
- `confirmResource`
- `packageBatch`
- `packageBatchItem`

## 通用组件

| 组件 | 说明 |
| --- | --- |
| `MainLayout` | 首页外层布局。 |
| `CommonModal` | 通用弹窗封装。 |
| `CommonUpload` | 基于 COS 临时凭证的通用上传组件。 |
| `ChatInput` | 聊天输入区。 |
| `IconWidget` | SVG 和图片图标统一入口。 |
| `TableLayout` | 表格布局组件。 |
| `WithAsync` | 异步组件封装。 |

## Hooks 和工具

| 文件 | 说明 |
| --- | --- |
| `src/hooks/useStompSocket.ts` | 创建 STOMP 连接，订阅用户队列。 |
| `src/hooks/useFetchWithCache.tsx` | 带 session/local 缓存的请求 hook。 |
| `src/hooks/useAuth.tsx` | 鉴权相关 hook。 |
| `src/utils/auth.ts` | Token 读写和退出登录。 |
| `src/utils/stompSocket.ts` | STOMP 客户端封装和重连。 |
| `src/utils/index.ts` | 下载、COS、URL 参数、Markdown 文本转换等工具。 |
