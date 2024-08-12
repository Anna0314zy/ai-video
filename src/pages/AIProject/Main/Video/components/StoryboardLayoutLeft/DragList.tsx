import React, { useState, useContext } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Flex } from 'antd'
import { MyContext } from '../..'
import FrameItem from './modules/FrameItem'
const DragList = () => {
  const { list, setList, curId, setCurId } = useContext(MyContext)
  const [currentSelectIndex, setCurrentSelectIndex] = useState(0)
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
                      <FrameItem
                        onClick={() => setCurrentSelectIndex(index)}
                        key={index}
                        index={index + 1}
                        img={
                          'http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960'
                        }
                        active={index === currentSelectIndex}
                      />
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
