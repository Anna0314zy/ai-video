import { Layout, Button } from 'antd'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getQueryParam } from '@/utils'
import { getProjectDetail as getDetail, ProjectList } from '@/api/models/project'
import { convertToMarkdown } from '@/utils'
import { MessageList, ScriptPageList, PAGE_SIZE } from '@/api/types/script'
import useStompSocket from '@/hooks/useStompSocket'
import { SCRIPT_SUBSCRIBE_THOROUGH, SCRIPT_SEND_THOROUGH, SCRIPT_END_SUBSCRIBE_THOROUGH } from '@/const/socket'
import { throttle } from 'lodash-es'
import { createModel } from '@rematch/core'
import { RootModel } from '.'
import { ResourceType, ShotList } from '@/api/types/video'
import * as api from '@/api/models/aiScript'
import { RootState } from '..'

interface AiScriptState {
  messageList: MessageList[]
  messageListTotalLength: number
  scriptPageListTotalLength: number
  scriptPageList: ScriptPageList[]
  currentSessionId?: number
  currentProjectDetail: ProjectList
}
export default createModel<RootModel>()({
  state: {
    messageList: [],
    messageListTotalLength: 0,
    scriptPageListTotalLength: 0,
    scriptPageList: [],
    currentSessionId: 0,
    currentProjectDetail: {} as ProjectList,
  } as AiScriptState,
  reducers: {
    updateData(state, payload: any) {
      return Object.assign(state, payload)
    },
    // 删除最后一项
    deleteLastMessage(state, payload: any) {
      const { messageList } = state
      return {
        ...state,
        messageList: messageList.filter(v => !v.requesting),
      }
    },
    updateMessageList(state, payload: Partial<MessageList> | Partial<MessageList>[]) {
      const dataArray = Array.isArray(payload) ? payload : [payload]
      // 更新消息列表
      const updatedList = state.messageList.map(v => {
        const updatedMessage = dataArray.find(d => d.id === v.id)
        return updatedMessage ? Object.assign({}, v, updatedMessage) : v
      })

      // 添加新的消息
      const newMessages = dataArray.filter(d => !state.messageList.some(v => v.id === d.id))
      const finalList = [...updatedList, ...newMessages]
      // 更新状态
      return {
        ...state,
        messageList: finalList as MessageList[],
      }
    },
    updateMessageListByScriptId(state, scriptId: number) {
      const updatedList = state.messageList.map(v => {
        if (v.scriptId === scriptId) {
          return Object.assign({}, v, {
            scriptId: 0,
          })
        }
        return v
      })
      return {
        ...state,
        messageList: updatedList,
      }
    },
  },
  effects: dispatch => ({
    async getScriptPageList(
      {
        projectId,
        current,
        size = PAGE_SIZE,
        scroll = false,
      }: { projectId: number; current?: number; size?: number; scroll?: boolean },
      state: RootState,
    ) {
      console.log('zy getScriptPageList', projectId, current, size, scroll)
      const res = await api.getPageScript({ projectId, current: current || 1, size })
      const records = res.records || []
      dispatch.aiScript.updateData({
        scriptPageList: scroll ? [...state.aiScript.scriptPageList, ...records] : records,
        scriptPageListTotalLength: res.total,
      })
      return records
    },
    async getChatHistories(
      { current = 1, size = PAGE_SIZE, scroll = false }: { current: number; size?: number; scroll?: boolean },
      state: RootState,
    ) {
      if (!state.aiScript.currentSessionId) return []
      const res = await api.getChatHistories({ sessionId: state.aiScript.currentSessionId!, current, size })
      const records = res.records || []
      console.log('zy loadMore getChatHistories', records)
      const data = records.map(v => {
        return {
          ...v,
          messageContent: convertToMarkdown(v.messageContent || ''),
        }
      })

      dispatch.aiScript.updateData({
        messageList: scroll ? [...data, ...state.aiScript.messageList] : data,
        messageListTotalLength: res.total,
      })
      return data
    },
    async getProjectDetail({ projectId }: { projectId: number }, state: RootState) {
      const { latestSessionId, project } = await getDetail(projectId)
      console.log('zy getProjectDetail', latestSessionId, project)
      dispatch.aiScript.updateData({
        currentProjectDetail: project,
        currentSessionId: latestSessionId || 0,
      })
      return latestSessionId
    },
  }),
})
