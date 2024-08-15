import { FC, useState, useContext } from 'react'
import { Layout, Flex } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import ContentMenu from './modules/RightClick'
import FrameItem from './modules/FrameItem'
import { MyContext } from '../../MyContext'
export default () => {
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
    <Layout.Sider width={'13.88vw'} className='page-storyboard-left'>
      <div className='page-storyboard-left__header'>
        <span>共32个镜头</span>
        <span>新建镜头</span>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='shot'>
          {provided => (
            <Flex className='shot' {...provided.droppableProps} ref={provided.innerRef} vertical={true}>
              {list?.map((data, index) => {
                return (
                  <Draggable key={data.shotId} draggableId={String(data.shotId)} index={index}>
                    {provided => (
                      <ContentMenu>
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <FrameItem
                            onClick={() => setCurrentSelectIndex(index)}
                            key={index}
                            index={index + 1}
                            img={data.imageUrl}
                            active={index === currentSelectIndex}
                          />
                        </div>
                      </ContentMenu>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
    </Layout.Sider>
  )
}
