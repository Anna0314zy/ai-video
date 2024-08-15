import React, { useState, useContext } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Flex } from 'antd'
import { MyContext } from '../../index'
import FrameItem from './modules/FrameItem'
import { useSelector, useDispatch } from 'react-redux'
import { Dispatch, RootState } from '@/store'
import { ShotList } from '@/api/types/video'
const DragList = () => {
  const [currentSelectIndex, setCurrentSelectIndex] = useState(0)
  const { shotList, currentShotId } = useSelector((state: RootState) => state.aiVideo)
  const dispatch = useDispatch<Dispatch>()
  function handleOnDragEnd(result: any) {
    if (!result.destination) return

    const items = Array.from(shotList)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    dispatch.aiVideo.updateData({
      shotList: items.map((v: any, index) => ({
        ...v,
        sortIndex: index + 1,
      })),
    })
  }
  const handleItemClick = (item: ShotList) => {
    dispatch.aiVideo.updateData({
      currentShotId: item.shotId,
    })
  }
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId='shot'>
        {provided => (
          <Flex className='shot' {...provided.droppableProps} ref={provided.innerRef} vertical={true}>
            {shotList?.map((data, index) => {
              return (
                <Draggable key={data.shotId} draggableId={String(data.shotId)} index={index}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <FrameItem
                        onClick={() => handleItemClick(data)}
                        key={index}
                        index={index + 1}
                        img={data.imageUrl}
                        active={data.shotId === currentShotId}
                      />
                      {/* {data.name} */}
                    </div>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </Flex>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragList
