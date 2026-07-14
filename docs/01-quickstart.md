# 本地启动与开发环境

## 环境要求

建议使用：

| 工具 | 说明 |
| --- | --- |
| Node.js | 建议使用 Node 20，与 `@types/node` 主版本一致。 |
| pnpm | 项目脚本使用 `pnpm`。 |
| 浏览器 | Chrome 或其他现代浏览器。 |
| 后端环境 | 需要能访问对应的 API、SSO、Socket 和七牛云服务。 |

## 安装依赖

```bash
pnpm install
```

## 启动开发服务

首次启动后端前先初始化本地数据库：

```bash
pnpm --filter @ai-video/server db:generate
pnpm --filter @ai-video/server db:push
```

可以提前创建一个可登录用户，也可以直接在登录页首次输入用户名和密码自动注册：

```bash
USERNAME=admin PASSWORD=your-password pnpm --filter @ai-video/server user:create
```

```bash
pnpm run dev:web
pnpm run dev:server
```

开发服务端口固定为 `5155`：

```ts
server: {
  strictPort: true,
  port: 5155,
}
```

如果端口被占用，Vite 会直接启动失败，需要先释放端口或修改 `vite.config.ts`。

## 环境变量

`vite.config.ts` 配置了：

```ts
envDir: 'env'
```

因此前端环境文件放在 `apps/web/env/` 下，例如 `apps/web/env/.env.dev`、`apps/web/env/.env.test`、`apps/web/env/.env.prod`。

代码中使用到的环境变量如下：

| 变量 | 用途 |
| --- | --- |
| `VITE_API_SERVER` | 后端 API 基础地址。 |
| `VITE_SOCKET_BASE` | SockJS/STOMP 连接地址。 |
| `VITE_QINIU_BUCKET_NAME` | 七牛云 Bucket，当前为 `qiqi123456`。 |
| `VITE_QINIU_PUBLIC_DOMAIN` | 七牛云公开访问域名或 CDN 域名。 |
| `VITE_CDN_SERVER` | CDN 域名。 |
| `VITE_STORAGE_QINIU_KEY` | session/local storage 中缓存七牛云 uploadToken 的数据键。 |
| `VITE_STORAGE_QINIU_TIME` | session/local storage 中缓存七牛云 uploadToken 时间戳的键。 |

## 本地接口

开发环境默认连接新的 NestJS 后端：

| 项 | 目标 |
| --- | --- |
| HTTP API | `http://localhost:4000` |
| Swagger | `http://localhost:4000/api-docs` |
| SockJS/STOMP | `http://localhost:4000/api/ws` |

旧服务端不可用，业务接口不再代理到旧服务；如需修改地址，请调整 `apps/web/env/.env.*` 中的 `VITE_API_SERVER` 和 `VITE_SOCKET_BASE`。

## 本地验证

建议至少执行：

```bash
pnpm run build:server
pnpm run build:web
```

如果缺少环境文件，构建可能在类型或运行时配置阶段暴露问题。先补齐环境变量，再验证主流程。

## 登录说明

前端登录页为 `#/login`，默认用户名为 `admin`，提交用户名和密码到新 Nest 后端。用户名不存在时后端会使用本次密码创建用户；用户名已存在时后端校验 `User` 表中的密码哈希。登录成功后返回 JWT，前端保存到 `localStorage.token`，并在 Axios 请求和 STOMP 连接中携带。

接口返回 `code = 30001` 时，前端会清除本地 Token 并跳转登录页。
