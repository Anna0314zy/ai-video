import { FC, useState, useContext } from 'react'
import { Layout, Flex, Modal } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import RightClick from './modules/RightClick'
import FrameItem from './modules/FrameItem'
import { useSelector, useDispatch } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { ShotList } from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
import { useParams } from 'react-router-dom'
import './index.less'

export default () => {
  const { shotList, currentShotId } = useSelector((state: RootState) => state.aiVideo)
  const dispatch = useDispatch<Dispatch>()
  const { id } = useParams() // 获取路由参数 userId
  function handleOnDragEnd(result: any) {
    console.log('%c 🚀 ~ [ result ]-15', 'font-size:14px; background:green; color:#fff;', result)
    if (!result.destination) return

    const items = Array.from(shotList)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    dispatch.aiVideo.updateData({
      shotList: items.map((v: any, index) => ({
        ...v,
        sort: index + 1,
      })),
    })

    console.log('%c 🚀 ~ [ shotList ]-27', 'font-size:14px; background:green; color:#fff;', shotList)
  }
  const handleItemClick = (item: ShotList) => {
    dispatch.aiVideo.updateData({
      currentShotId: item.shotId,
    })
  }
  const onInsterShot = (type: string, index: number) => {
    const items = Array.from(shotList)
    items.splice(type === 'up' ? (index === 0 ? 0 : index - 1) : index + 1, 0, {
      narration: '',
      sort: type === 'up' ? (index === 0 ? 0 : index - 1) : index + 1,
    })
    const _shotList = items.map((v: any, index) => ({
      ...v,
      sort: index + 1,
    }))
    dispatch.aiVideo.updateData({
      shotList: _shotList,
    })

    console.log('%c 🚀 ~ [  ]-49', 'font-size:14px; background:green; color:#fff;', _shotList)
    api.saveShotList({
      projectId: Number(id),
      shotInfoDtoList: _shotList,
    })
    // .then(() => {
    //   dispatch.aiVideo.getShotListByProjectId(Number(id))
    // })
  }
  const onDelete = (index: number) => {
    const items = Array.from(shotList)
    items.splice(index, 1)
    const _shotList = items.map((v: any, index) => ({
      ...v,
      sort: index + 1,
    }))
    dispatch.aiVideo.updateData({
      shotList: _shotList,
    })
    api.saveShotList({
      projectId: Number(id),
      shotInfoDtoList: _shotList,
    })
  }
  return (
    <div className='page-storyboard-left'>
      <div className='page-storyboard-left__header'>
        <span>共32个镜头</span>
        <span onClick={() => onInsterShot('up', 0)}> 新建镜头</span>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='shot'>
          {provided => (
            <Flex className='shot' {...provided.droppableProps} ref={provided.innerRef} vertical={true}>
              {shotList?.map((data, index) => {
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
                        onDownload={() => {
                          api.packageBatch([currentShotId])
                          // 下载资源
                        }}>
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <FrameItem
                            onClick={() => {
                              dispatch.aiVideo.updateData({
                                currentShotId: data.shotId,
                                selectedShot: data,
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
