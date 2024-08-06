// 生成剧本时解析Prompt
export type ScriptPrompt = {
  scriptType?: string // 剧本类型
  scriptStyle?: string // 剧本风格
  scriptTitle?: string // 剧本主题
  characters?: string // 主角、配角，用英文逗号分隔
  duration?: number // 总时长，单位秒
  shotNum?: number // 镜头数量
  wordNum?: number //剧本字数
}
//会话信息
export interface MessageList {
  projectId?: number // 项目id
  sessionId: number // 会话id
  messageRole: 'gpt' | 'user'
  messageType?: string // 消息类型，gpt表示gpt返回消息；user表示员工发送的消息；file表示上传的文件消息
  messageContent?: string // 消息内容，如果消息类型是file，返回文件链接
  messageSize?: number // 消息大小
  fromUserId?: number // 如果消息类型是user，员工uid
  fromUser?: string // 如果消息类型是user，员工名称
  userId?: number // 创建会话的员工uid
  createUser?: string // 创建会话的员工名称
  createTime: number // 创建时间
  requesting?: boolean // 请求中
  sending?: boolean // 发送中
  id: string
}
