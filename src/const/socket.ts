// SOCKET  发送通道
export const SEND_THOROUGH = '/app/message'

// SOCKET 订阅通道
export const SUBSCRIBE_THOROUGH = '/user/queue/task/ming'
// 文生图任务通知
export const TEXT_TO_IMAGE_THOROUGH = `/user/queue/task/text2img`

// /user/queue/task/text2img/{account_id}  文生图任务通知
// /user/queue/task/img2video/{account_id}   图生视频任务通知
// /user/queue/task/tts/{account_id}   TTS任务通知
// /user/queue/shots/download/{account_id}   打包下载通知
//  生成剧本
export const SCRIPT_SUBSCRIBE_THOROUGH = `/user/queue/session/chat/reply`
export const SCRIPT_SEND_THOROUGH = `/app/ai/stream/session/chat`

export const IMAGE_TO_VIDEO_THOROUGH = `/user/queue/task/img2video`

export const TTS_THOROUGH = `/user/queue/task/tts`

export const PACKAGE_DOWNLOAD_THOROUGH = `/user/queue/shots/download`

export const SCRIPT_END_SUBSCRIBE_THOROUGH = '/user/queue/session/chat/reply/completed'
