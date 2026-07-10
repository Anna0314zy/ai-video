# 常见问题与排障

## 启动失败：找不到环境变量

现象：

- 页面请求地址是 `undefined/api/...`。
- 登录地址异常。
- Socket 无法连接。
- COS 上传/下载失败。

检查：

- `env/` 目录是否存在。
- 当前命令的 mode 是否和环境文件匹配，例如 `pnpm run dev` 对应 `vite --mode dev`。
- 是否配置了 `VITE_API_SERVER`、`VITE_SOCKET_BASE`、`VITE_APP_LOGIN`、COS/CDN 相关变量。

## 启动失败：端口 5155 被占用

项目配置：

```ts
strictPort: true
port: 5155
```

处理：

- 释放本地 `5155` 端口。
- 或临时修改 `vite.config.ts` 中的端口。

## 登录后又跳回登录页

可能原因：

- `localStorage.token` 不存在或已过期。
- 后端返回业务码 `30001`。
- `VITE_APP_LOGIN` 配置错误。
- SSO 回跳没有正确带回前端地址。

排查入口：

- `src/config/login.ts`
- `src/utils/auth.ts`
- `src/api/index.ts`
- 浏览器 Network 中的 `/api/account/userInfo/get`

## 项目列表为空

可能原因：

- 当前账号确实没有项目。
- `projectList` 请求失败。
- Token 过期但页面未明显感知。

排查入口：

- `src/pages/AIProject/List/index.tsx`
- `src/api/models/project.ts`
- 浏览器 Network 中的 `/api/project/page`

## 剧本页一直 Loading

`CheckLogin` 会先调用 `dispatch.auth.getUserInfo()`，完成后才渲染页面。

检查：

- `/api/account/userInfo/get` 是否成功。
- 是否返回了 `accountId`，Socket 订阅依赖该字段拼接用户通道。
- Axios 是否拦截到 `30001` 并跳转登录。

## 剧本聊天没有回复

可能原因：

- `VITE_SOCKET_BASE` 错误。
- `accountId` 为空，导致订阅路径不正确。
- STOMP 连接失败。
- 后端没有向 `/user/queue/session/chat/reply/{accountId}` 推送消息。
- 发送通道 `/app/ai/stream/session/chat` 没有被后端处理。

排查入口：

- `src/hooks/useStompSocket.ts`
- `src/utils/stompSocket.ts`
- `src/const/socket.ts`
- `src/pages/AIProject/Main/Sctipt/Chat/ChatControl.tsx`
- 浏览器 Console 中的 WebSocket 日志。

## 剧本确认后没有进入视频页

检查：

- `confirmScript` 是否成功。
- `targetScript` 是否存在，是否选择了剧本。
- 路由跳转 `/project/:id/video` 是否执行。

排查入口：

- `src/pages/AIProject/Main/Sctipt/RightPanel/index.tsx`
- `/api/text/v1/confirmScript`

## 镜头页没有分镜列表

可能原因：

- 剧本尚未确认或后端未生成分镜。
- `getShotListByProjectId` 返回空。
- 项目 ID 解析失败。

排查入口：

- `src/pages/AIProject/Main/Video/index.tsx`
- `src/store/models/aiVideo.ts`
- `/api/scriptShot/v1/shotListByProjectId`

## 图片/音频/视频任务状态不更新

可能原因：

- Socket 未连接。
- 用户通道拼接的 `accountId` 不正确。
- 后端任务没有推送到对应通道。
- 任务历史接口可查到结果，但 Socket 更新丢失。

对应通道：

| 类型 | 通道 |
| --- | --- |
| 图片 | `/user/queue/task/text2img/{accountId}` |
| 视频 | `/user/queue/task/img2video/{accountId}` |
| 音频 | `/user/queue/task/tts/{accountId}` |

排查入口：

- `src/pages/AIProject/Main/Video/index.tsx`
- `src/store/models/aiVideo.ts`
- `src/const/socket.ts`

## 上传失败

可能原因：

- COS 临时凭证获取失败。
- `common.pathConfig` 未加载。
- `VITE_BUCKET` 或 `VITE_REGION` 配置错误。
- 上传类型没有匹配到 COS 路径。

排查入口：

- `src/components/CommonUpload/index.tsx`
- `src/api/models/common.ts`
- `src/store/models/common.ts`
- `/api/cos/v1/credential`
- `/api/cos/v1/pathConfig`

## 打包导出没有下载

打包流程依赖后端任务和 Socket 通知。

检查：

- `packageBatch(shotIds)` 是否成功。
- 是否订阅 `/user/queue/shots/download/{accountId}`。
- 通知 payload 是否是 COS key。
- sessionStorage 中是否存在 COS 临时凭证。

排查入口：

- `src/pages/AIProject/Main/Video/index.tsx`
- `src/utils/index.ts`
- `/api/scriptShot/v1/packageBatch`

## 发布失败

可能原因：

- `dist/` 不存在，需要先构建。
- `src/script/cos.config.json` 缺失。
- COS 密钥、Bucket 或 Region 错误。
- 当前环境在 `publish.config.json` 中不存在。

排查入口：

- `src/script/hotUpdate.cjs`
- `src/script/publish.config.json`
- `package.json` 中的 release 脚本。
