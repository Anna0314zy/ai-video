# 系统架构

## 总体结构

```mermaid
flowchart LR
  Browser["浏览器 / React 应用"]
  Router["React Router Hash 路由"]
  Store["Rematch Store"]
  Api["Axios API 层"]
  Socket["SockJS + STOMP"]
  Backend["后端业务服务"]
  AI["AI / 任务服务"]
 七牛云["七牛云/ CDN"]
  Auth["JWT 登录"]

  Browser --> Router
  Browser --> Store
  Store --> Api
  Browser --> Api
  Browser --> Socket
  Api --> Backend
  Socket --> Backend
  Backend --> AI
  Backend -->七牛云
  Browser -->七牛云
  Browser --> Auth
  Auth --> Backend
```

## 前端分层

| 层级 | 位置 | 职责 |
| --- | --- | --- |
| 应用入口 | `apps/web/src/main.tsx`、`apps/web/src/App.tsx` | 注入主题、语言包、状态容器和路由。 |
| 路由层 | `apps/web/src/router/index.tsx` | 定义首页、剧本页、视频页和 404。 |
| 页面层 | `apps/web/src/pages/` | 承载业务流程页面。 |
| 组件层 | `apps/web/src/components/` | 通用布局、弹窗、上传、输入、图标。 |
| 状态层 | `apps/web/src/store/models/` | 管理用户、项目详情、会话、剧本、分镜和资源历史。 |
| 接口层 | `apps/web/src/api/models/` | 封装 HTTP、流式请求和任务接口。 |
| 工具层 | `apps/web/src/utils/`、`apps/web/src/hooks/` | Token、七牛云、下载、Socket、缓存请求等能力。 |

## 路由架构

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | `Home` | 我的项目列表。 |
| `/login` | `Login` | 用户名密码登录页，登录成功后保存 JWT。 |
| `/project/:id/script` | `AIProject/Main/Sctipt` | 剧本设计页，进入前会加载用户信息。 |
| `/project/:id/video` | `AIProject/Main/Video` | 镜头设计页，进入前会加载用户信息。 |
| `*` | `NotFound` | 未匹配页面。 |

项目使用 `createHashRouter`，因此真实访问形态是 `#/project/:id/script`。

## 状态架构

| Model | 文件 | 主要状态 |
| --- | --- | --- |
| `auth` | `apps/web/src/store/models/auth.ts` | 当前用户信息。 |
| `aiScript` | `apps/web/src/store/models/aiScript.ts` | 当前项目、当前会话、聊天历史、剧本列表、剧本生成状态。 |
| `aiVideo` | `apps/web/src/store/models/aiVideo.ts` | 当前分镜、分镜列表、图片/视频/音频资源历史、终选资源。 |
| `common` | `apps/web/src/store/models/common.ts` | 七牛云路径配置。 |

## 请求架构

所有普通 HTTP 请求经过 `apps/web/src/api/index.ts` 的 Axios 实例：

- 请求头自动带 `Authorization: localStorage.token`。
- 业务成功码为 `200`。
- 业务过期码 `30001` 会跳转登录。
- 默认超时时间为 120 秒。

流式文本生成存在两种实现：

- `apps/web/src/api/models/chat.ts` 使用 `fetchEventSource` 请求文本流。
- 当前剧本页主要通过 STOMP 发送 `/app/ai/stream/session/chat`，再订阅用户队列接收回复。

## 实时消息架构

`useStompSocket` 负责创建连接：

```ts
new StompSocket({
  baseUrl: import.meta.env.VITE_SOCKET_BASE,
  sendThorough,
  subscribeThorough: subscribeThorough.map(v => `${v.path}/${accountId}`),
})
```

订阅通道会追加 `accountId`，例如：

```text
/user/queue/task/text2img/{accountId}
/user/queue/session/chat/reply/{accountId}
```

`StompSocket` 内置最多 3 次重连，每次间隔 5 秒。

## 文件与七牛云架构

应用启动时，`App.tsx` 通过 `useFetchWithCache(getQiniuUploadToken, 3600 * 1000, 'session')` 缓存七牛云 uploadToken。

上传链路：

```mermaid
sequenceDiagram
  participant User as 用户
  participant FE as 前端 CommonUpload
  participant API as 后端七牛云接口
  participant七牛云as七牛云

  User->>FE: 选择文件
  FE->>API: 获取uploadToken
  API-->>FE: 返回 credentials
  FE->>FE: 读取 pathConfig 和环境变量
  FE->>七牛云: 上传文件
 七牛云-->>FE: 返回上传结果
```

下载链路分为两类：

- 普通后端文件：`downloadFromServer` 通过 Axios 下载 Blob。
-七牛云对象：`downloadQiniuObjectFile` 通过uploadToken读取对象并创建浏览器下载链接。
