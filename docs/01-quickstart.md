# 本地启动与开发环境

## 环境要求

建议使用：

| 工具 | 说明 |
| --- | --- |
| Node.js | 建议使用 Node 20，与 `@types/node` 主版本一致。 |
| pnpm | 项目脚本使用 `pnpm`。 |
| 浏览器 | Chrome 或其他现代浏览器。 |
| 后端环境 | 需要能访问对应的 API、SSO、Socket 和 COS 服务。 |

## 安装依赖

```bash
pnpm install
```

## 启动开发服务

```bash
pnpm run dev
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

因此环境文件应放在项目根目录的 `env/` 下，例如 `env/.env.dev`、`env/.env.test`、`env/.env.prod`。当前仓库未提交这些文件。

代码中使用到的环境变量如下：

| 变量 | 用途 |
| --- | --- |
| `VITE_API_SERVER` | 后端 API 基础地址。 |
| `VITE_SOCKET_BASE` | SockJS/STOMP 连接地址。 |
| `VITE_APP_LOGIN` | SSO 登录地址。 |
| `VITE_BUCKET` | COS Bucket。 |
| `VITE_REGION` | COS Region。 |
| `VITE_COS_URL` | COS 原始访问域名，用于替换 CDN 域名。 |
| `VITE_CDN_SERVER` | CDN 域名。 |
| `VITE_STORAGE_COS_KEY` | session/local storage 中缓存 COS 凭证的数据键。 |
| `VITE_STORAGE_COS_TIME` | session/local storage 中缓存 COS 凭证时间戳的键。 |

## 本地代理

开发环境配置了两个代理：

| 本地路径 | 目标 |
| --- | --- |
| `/api` | `https://ai-tool-test.ledupeiyou.com` |
| `/test` | `https://test-class-api-online.saasp.vdyoo.com` |

实际业务接口大多使用 `VITE_API_SERVER` 拼接完整地址。代理主要用于需要走本地同源路径的场景。

## 本地验证

建议至少执行：

```bash
pnpm run lint
pnpm run build:test
```

如果缺少环境文件，构建可能在类型或运行时配置阶段暴露问题。先补齐环境变量，再验证主流程。

## 登录说明

前端通过 `localStorage.token` 读取 Token，并在 Axios 请求和 STOMP 连接中携带。

登录跳转地址由 `src/config/login.ts` 生成：

```ts
VITE_APP_LOGIN + '?frontUrl=' + 当前页面地址
```

接口返回 `code = 30001` 时，前端会清除本地 Token 并跳转登录页。
