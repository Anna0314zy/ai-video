
import Style from './index.module.less'
import ChatEnterControl from './chatEnterControl'
import ChatEnterSend from './chatEnterSend'


const ChatEnter: React.FC = (props) => {
    
    return (
       <div className={Style['chat-enter']}>
            <ChatEnterControl />
            <ChatEnterSend />
       </div>
    )
}

export default ChatEnter