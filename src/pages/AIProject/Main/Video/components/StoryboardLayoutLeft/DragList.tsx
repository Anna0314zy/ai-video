import React, { useState, useContext } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import StoryboardCard from '../StoryboardCard'
import { Flex } from 'antd'
import { MyContext } from '../..'
const DragList = () => {
  const { list, setList, curId, setCurId } = useContext(MyContext)

  function handleOnDragEnd(result: any) {
    if (!result.destination) return

    const items = Array.from(list)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setList(
      items.map((v: any, index) => ({
        ...v,
        sortIndex: index + 1,
      })),
    )
  }
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId='characters'>
        {provided => (
          <Flex className='characters' {...provided.droppableProps} ref={provided.innerRef} vertical={true}>
            {list.map((data, index) => {
              return (
                <Draggable key={data.id} draggableId={data.id} index={index}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <StoryboardCard data={data} />
                      {data.name}
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
