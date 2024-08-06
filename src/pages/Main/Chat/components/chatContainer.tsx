import InfiniteScroll from 'react-infinite-scroll-component'
import { useState } from 'react'
import Style from '../index.module.less'

const style = {
  height: 30,
  margin: 6,
  padding: 8,
  color: 'red',
}
const ChatContainer = (props: { containerRef: any }) => {
  const [state, setState] = useState({
    items: Array.from({ length: 20 }),
  })

  const fetchMoreData = () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    setTimeout(() => {
      setState({
        items: state.items.concat(Array.from({ length: 20 })),
      })
    }, 1500)
  }
  return (
    <div style={{ flex: 1, overflow: 'hidden' }} className='chat-content'>
      <div
        id='scrollableDiv'
        ref={props.containerRef}
        style={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          backgroundColor: '#F2F3F7',
          height: '100%',
          color: '#14141A',
        }}>
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={state.items.length}
          next={fetchMoreData}
          style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={true}
          loader={<h4 style={{ color: 'red' }}>Loading...</h4>}
          scrollableTarget='scrollableDiv'>
          {state.items.map((_, index) => (
            <div style={style} key={index}>
              div - #{index}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  )
}

export default ChatContainer
