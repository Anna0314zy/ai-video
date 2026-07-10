# 部署与发布

## 构建命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run build:test` | TypeScript 构建检查 + Vite test 模式构建。 |
| `pnpm run build:prod` | TypeScript 构建检查 + Vite prod 模式构建。 |
| `pnpm run preview` | 本地预览构建产物。 |

构建产物输出到：

```text
dist/
```

Vite 配置中 `base: './'`，适合静态资源以相对路径部署。

## 发布命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run hotUpdate:test` | 将 `dist/` 上传到 test 对应 COS 前缀。 |
| `pnpm run hotUpdate:prod` | 将 `dist/` 上传到 prod 对应 COS 前缀。 |
| `pnpm run release:test` | 安装依赖、test 构建、上传 COS。 |
| `pnpm run release:prod` | 安装依赖、prod 构建、上传 COS。 |

## 发布配置

文件：`src/script/publish.config.json`

| 环境 | CDN | 前缀 | 文件名前缀 | 更新 API |
| --- | --- | --- | --- | --- |
| `test` | `https://static.xuepeiyou.com` | `/ai-content-platform/test` | `sdk_test` | `https://retest-course-api-online.saasp.vdyoo.com/course/v1/meta-data/mcc-resource-sdk` |
| `prod` | `https://static.xuepeiyou.com` | `/ai-content-platform/prod` | `sdk_production` | `https://retest-course-api-online.saasp.vdyoo.com/course/v1/meta-data/mcc-resource-sdk` |

## COS 上传脚本

文件：`src/script/hotUpdate.cjs`

上传流程：

1. 读取 `--mode` 参数，默认 `test`。
2. 从 `publish.config.json` 读取上传前缀。
3. 从 `src/script/cos.config.json` 读取 COS 密钥、Bucket 和 Region。
4. 遍历 `dist/`。
5. 将文件和目录上传到 COS。

当前仓库的 `rg --files` 结果中未看到 `src/script/cos.config.json`，发布前需要确认该文件由本地、CI 或密钥系统注入。

## 环境变量文件

构建使用 `vite --mode test` 或 `vite --mode prod`，并且 `vite.config.ts` 指定 `envDir: 'env'`。

建议环境文件命名：

```text
env/.env.dev
env/.env.test
env/.env.prod
```

至少应包含：

```text
VITE_API_SERVER=
VITE_SOCKET_BASE=
VITE_APP_LOGIN=
VITE_BUCKET=
VITE_REGION=
VITE_COS_URL=
VITE_CDN_SERVER=
VITE_STORAGE_COS_KEY=
VITE_STORAGE_COS_TIME=
```

## 发布前检查清单

- 环境文件已存在，且目标环境变量正确。
- `pnpm run lint` 通过。
- `pnpm run build:test` 或 `pnpm run build:prod` 通过。
- `dist/` 产物可通过 `pnpm run preview` 打开。
- COS 发布密钥文件或 CI 密钥已准备。
- 登录、项目列表、剧本页、镜头页、上传、Socket 通知至少完成一次冒烟验证。
