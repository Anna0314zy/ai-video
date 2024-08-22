import MaterialItem from '../MaterialItem'
import { ScriptPageList } from '@/api/types/script'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { Flex } from 'antd'
import { get } from 'lodash-es'
import { useSize } from 'ahooks'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Divider, Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import IconWidget from '@/components/IconWidget'
export default ({ handleChoose, activeObj }: { activeObj: any; handleChoose: (val: ScriptPageList) => void }) => {
  const { scriptPageListMap } = useSelector((state: RootState) => state.aiScript)
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams()
  const loadMoreData = async (scroll: boolean, current?: number) => {
    // 如果是滚动 需要计算从哪一页开始请求
    const data = get(scriptPageListMap, `data`, [])
    const size = get(scriptPageListMap, `size`)
    await dispatch.aiScript.getScriptPageList({
      projectId: Number(id),
      scroll,
      current: current ? current : data?.length > 0 ? Math.round(data.length / size) + 1 : 1,
    })
  }
  useEffect(() => {
    loadMoreData(false, 1)
  }, [])
  const wrapper = useRef<HTMLDivElement>(null)
  const size = useSize(wrapper)
  const hasMore = useMemo(() => {
    const total = scriptPageListMap.total
    const messageListLength = (scriptPageListMap.data || []).length
    return total !== null ? messageListLength < total : true
  }, [scriptPageListMap])
  useEffect(() => {
    console.log('%c hasMore', 'color:red;', hasMore, size?.height)
  }, [hasMore, size])

  return (
    <div style={{ height: '100%', width: '100%' }} ref={wrapper}>
      {size?.height ? (
        <InfiniteScroll
          height={size?.height}
          dataLength={get(scriptPageListMap, `data`, []).length}
          next={() => loadMoreData(true)}
          hasMore={hasMore}
          loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
          endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}>
          {!scriptPageListMap?.total ? (
            <>
              <Flex vertical={true} align='center' justify='center' style={{ width: '100%' }}>
                <IconWidget name='empty' style={{ maxWidth: '100%', objectFit: 'contain' }} />
                <p>空空如也，快去创造剧本吧~</p>
              </Flex>
            </>
          ) : (
            get(scriptPageListMap, 'data')?.map(v => {
              return (
                <MaterialItem
                  icon='excel'
                  data={v}
                  onChange={handleChoose}
                  key={v.scriptId}
                  actived={activeObj[v.scriptId]}
                />
              )
            })
          )}
        </InfiniteScroll>
      ) : null}
    </div>
  )
}
