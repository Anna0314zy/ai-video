import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget'
import { MoreOutlined,CheckOutlined } from '@ant-design/icons'

interface IMaterialItem{
    data?:any   // 素材数据
    icon?:string // 素材icon
    actived?:boolean // 选中状态
}
export default (props:IMaterialItem)=>{
    return <div className={Styles["material-item"]} data-actived={props.actived}>
        <div className='material-item-left'>
            <IconWidget className='material-icon' name={props.icon} width={24} height={24}/>
            <div className='material-type'>【视频脚本】</div>
            <div className='material-name'>高尔基的童年</div>
            <div className='material-id'>YW3SL825</div>
        </div>
        <div className='material-item-right'>
            <button className='material-btn' onClick={()=>{}}>{props.actived?'取消':'确定'}</button>
            <MoreOutlined className='material-more'/>
        </div>
        <span className='material-status' hidden={!props.actived}>
            <IconWidget name='badgeTick' width={24} height={24}/>
        </span>
    </div>
}