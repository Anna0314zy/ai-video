import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  SCRIPT_ADD_THOROUGH,
  SCRIPT_END_SUBSCRIBE_THOROUGH,
  SCRIPT_SEND_THOROUGH,
  SCRIPT_SUBSCRIBE_AGAIN_THOROUGH,
  SCRIPT_SUBSCRIBE_RESEND_THOROUGH,
  SCRIPT_SUBSCRIBE_THOROUGH,
} from '@/const/socket'
import { RootState } from '@/store'
import useStompSocket from './useStompSocket'

type ScriptSocketMessageHandler = (message: any) => void

export interface ScriptSocketPayload {
  sessionId?: number
  sessionChatId?: string | number
  requestId?: string
  text?: string
  promptRequestLogId?: number
  attachmentFileId?: number
}

interface UseScriptSocketParams {
  onChunk: ScriptSocketMessageHandler
  onCompleted: ScriptSocketMessageHandler
  onScriptAdded: ScriptSocketMessageHandler
}

const useScriptSocket = ({ onChunk, onCompleted, onScriptAdded }: UseScriptSocketParams) => {
  const accountId = useSelector((state: RootState) => state.auth.userInfo.accountId)
  const subscriptions = useMemo(
    () => [
      {
        path: SCRIPT_SUBSCRIBE_THOROUGH,
        callback: onChunk,
      },
      {
        path: SCRIPT_END_SUBSCRIBE_THOROUGH,
        callback: onCompleted,
      },
      {
        path: SCRIPT_ADD_THOROUGH,
        callback: onScriptAdded,
      },
    ],
    [onChunk, onCompleted, onScriptAdded],
  )

  const { send, connected, reconnecting, error } = useStompSocket(subscriptions)

  const sendWithAccount = useCallback(
    (path: string, payload: ScriptSocketPayload) => {
      return send(path, {
        ...payload,
        accountId,
      })
    },
    [accountId, send],
  )

  const sendChat = useCallback(
    (payload: ScriptSocketPayload) => sendWithAccount(SCRIPT_SEND_THOROUGH, payload),
    [sendWithAccount],
  )

  const resendMessage = useCallback(
    (payload: ScriptSocketPayload) => sendWithAccount(SCRIPT_SUBSCRIBE_RESEND_THOROUGH, payload),
    [sendWithAccount],
  )

  const continueOutput = useCallback(
    (payload: ScriptSocketPayload) => sendWithAccount(SCRIPT_SUBSCRIBE_AGAIN_THOROUGH, payload),
    [sendWithAccount],
  )

  return {
    sendChat,
    resendMessage,
    continueOutput,
    connected,
    reconnecting,
    error,
  }
}

export default useScriptSocket
