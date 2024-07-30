import { useEffect, useState } from 'react'
import { Image } from "antd";
import Styles from './index.module.less'
console.log('Styles',Styles)
interface IStoryboardCard {
    index:number
    img?:string
    actived?:boolean
}
export default (props:IStoryboardCard) => {
    const {index,img,actived}= props
    const [fail,setFail] = useState(false)
    useEffect(()=>{
        setFail(false)
    },[props])

    return <div className={Styles["storyboard-card"]} data-actived={actived}>
        <div className="storyboard-card-index">{index}.</div>
        <div className="storyboard-card-img">
        {!fail && <Image src={img} width={'100%'} height={'100%'} preview={false} onError={()=>{
                setFail(true)
            }}/>}
        </div>
    </div>
}