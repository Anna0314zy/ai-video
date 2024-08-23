import { Flex, Modal } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import RightClick from './modules/RightClick'
import FrameItem from './modules/FrameItem'
import { useSelector, useDispatch } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { ShotList } from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect'
import './index.less'
import { useEffect } from 'react'

export default () => {
  const { shotList, currentShotId, currentSelectType, selectedShot } = useSelector((state: RootState) => state.aiVideo)
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams() // 获取路由参数 userId
  // 拖拽更新
  function handleOnDragEnd(result: any) {
    if (!result.destination) return
    const items = Array.from(shotList)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    sortUpdateShotList(items)
  }
  useDeepCompareEffect(() => {}, [currentShotId, shotList])
  // 插入更新
  const onInsterShot = async (type: string, index: number) => {
    const items = Array.from(shotList) as Partial<ShotList>[]
    items.splice(type === 'up' ? (index === 0 ? 0 : index - 1) : index + 1, 0, {
      narration: '',
      sort: type === 'up' ? (index === 0 ? 0 : index - 1) : index + 1,
    })
    sortUpdateShotList(items)
  }
  // 删除更新
  const onDelete = (index: number) => {
    const items = Array.from(shotList)
    items.splice(index, 1)
    sortUpdateShotList(items)
    if (index + 1 === selectedShot.sort) {
      dispatch.aiVideo.updateData({
        selectedShot: items[index],
      })
    }
  }

  const sortUpdateShotList = (preList: any) => {
    const _shotList = preList.map((v: any, index: number) => ({
      ...v,
      sort: index + 1,
    }))
    dispatch.aiVideo.updateData({
      shotList: _shotList,
    })
    api
      .saveShotList({
        projectId: Number(id),
        shotInfoDtoList: _shotList,
      })
      .then(() => {
        dispatch.aiVideo.getShotListByProjectId(Number(id))
      })
  }
  return (
    <div className='page-storyboard-left'>
      <div className='page-storyboard-left__header'>
        <span>共{shotList.length}个镜头</span>
        <span onClick={() => onInsterShot('up', 0)}> 新建镜头</span>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='shot'>
          {provided => (
            <Flex className='shot' {...provided.droppableProps} ref={provided.innerRef} vertical={true}>
              {shotList?.map((data: any, index) => {
                return (
                  <Draggable key={data.shotId} draggableId={String(data.shotId)} index={index}>
                    {provided => (
                      <RightClick
                        onInster={type => {
                          onInsterShot(type, index)
                        }}
                        onDelete={() => {
                          // 删除资源
                          Modal.warning({
                            title: '是否删除当前镜头？',
                            content: (
                              <div>
                                <p>删除后，该镜头内容将不可见。</p>
                              </div>
                            ),
                            okText: '删除',
                            cancelText: '取消',
                            onOk() {
                              onDelete(index)
                            },
                            onCancel() {},
                          })
                        }}
                        onDownload={async () => {
                          await api.packageBatch([currentShotId])
                          message.success('打包中...请稍后~')
                          // 下载资源
                        }}>
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <FrameItem
                            item={data}
                            onClick={() => {
                              dispatch.aiVideo.updateData({
                                currentShotId: data.shotId,
                                selectedShot: data || {},
                                resourceList: {},
                                currentSelectType:
                                  currentSelectType === 'voice' ? 'voice' : data?.previewImage ? 'video' : 'image',
                              })
                            }}
                            key={index}
                            index={index + 1}
                            img={`https://ai-tool-static-test.ledupeiyou.com${data.previewImage}`}
                            active={data.shotId === currentShotId}
                          />
                        </div>
                      </RightClick>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
