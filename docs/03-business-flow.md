# 核心业务流程

## 项目管理流程

```mermaid
sequenceDiagram
  participant User as 用户
  participant Page as 项目列表页
  participant API as Project API

  User->>Page: 打开首页
  Page->>API: projectList({ current, size })
  API-->>Page: 返回项目分页
  User->>Page: 新建项目
  Page->>API: 获取学科和季度选项
  Page->>API: projectSave(form)
  API-->>Page: 保存成功
  Page->>API: 重新查询项目列表
```

项目列表根据 `state` 决定编辑入口：

| 状态 | 文案 | 入口 |
| --- | --- | --- |
| `ScriptProcessing` | 剧本制作中 | `/project/:id/script` |
| `VideoProcessing` | 画面制作中 | `/project/:id/video` |
| `Completed` | 已完成 | `/project/:id/video` |

## 剧本设计流程

```mermaid
sequenceDiagram
  participant User as 用户
  participant ScriptPage as 剧本页
  participant Store as aiScript
  participant API as Script API
  participant WS as STOMP

  User->>ScriptPage: 进入项目剧本页
  ScriptPage->>API: getProjectDetail(projectId)
  API-->>Store: latestSessionId + project
  alt 没有会话
    ScriptPage->>API: createChat(projectId)
    ScriptPage->>API: getProjectDetail(projectId)
  end
  User->>ScriptPage: 填写脚本配置并点击应用
  ScriptPage->>API: getScriptPrompt(config)
  API-->>ScriptPage: prompt + promptRequestLogId
  User->>ScriptPage: 发送
  ScriptPage->>WS: /app/ai/stream/session/chat
  WS-->>ScriptPage: /user/queue/session/chat/reply/{accountId}
  WS-->>ScriptPage: /user/queue/session/chat/reply/completed/{accountId}
```

剧本页左侧是聊天生成，右侧是剧本资源列表。

用户可以：

- 应用配置生成 Prompt。
- 上传附件并随消息发送。
- 新建对话。
- 下载剧本模板。
- 导入 `.md`、`.xlsx`、`.docx` 剧本。
- 选择一个剧本并确认，确认后进入镜头设计页。

## 剧本确认流程

```mermaid
sequenceDiagram
  participant User as 用户
  participant Panel as 剧本资源面板
  participant API as Script API
  participant Router as Router

  User->>Panel: 选择剧本
  User->>Panel: 点击确认剧本
  Panel->>API: confirmScript({ projectId, scriptId })
  API-->>Panel: 确认成功
  Panel->>Router: 跳转 /project/:id/video
```

## 镜头设计流程

```mermaid
sequenceDiagram
  participant User as 用户
  participant VideoPage as 镜头页
  participant Store as aiVideo
  participant API as Video API
  participant WS as STOMP

  User->>VideoPage: 进入镜头页
  VideoPage->>API: getPathConfig()
  VideoPage->>API: getShotListByProjectId(projectId)
  API-->>Store: shotBaseInfoList
  User->>VideoPage: 选择分镜和资源类型
  VideoPage->>API: addText2imageTask / addAudioTask / addVideoTask
  API-->>Store: 初始任务消息
  WS-->>Store: 更新任务状态
```

镜头页由三块组成：

| 区域 | 说明 |
| --- | --- |
| 左侧 | 分镜列表，选择当前 `shotId`。 |
| 中间 | 当前资源类型的生成/对话操作区。 |
| 右侧 | 图片、视频、音频、结果等资源面板。 |

## 资源生成与确认

资源类型包括：

| 类型 | 枚举 | 生成接口 |
| --- | --- | --- |
| 图片 | `image` | `addText2imageTask` |
| 视频 | `video` | `addVideoTask` |
| 音频 | `voice` | `addAudioTask` |

任务状态包括：

| 状态 | 文案 |
| --- | --- |
| `Queued` | 队列中 |
| `Processing` | 生成中 |
| `Completed` | 已完成 |
| `Transcoding` | 转码中 |
| `Failed` | 已失败 |

用户可以对资源进行：

- 查看历史。
- 添加到资源库。
- 删除资源。
- 重新生成任务。
- 确认为当前分镜的终选资源。

## 打包导出流程

```mermaid
sequenceDiagram
  participant User as 用户
  participant VideoPage as 镜头页
  participant API as Video API
  participant WS as STOMP
  participant COS as COS

  User->>VideoPage: 点击打包导出
  VideoPage->>API: packageBatch(shotIds)
  API-->>VideoPage: 接受打包请求
  WS-->>VideoPage: /user/queue/shots/download/{accountId}
  VideoPage->>COS: downloadCosObjectFile(key, fileName)
```

前端只发起打包请求和下载文件，具体打包过程由后端完成。
