import IconConfig from './config'

interface IIconWidget {
    name?:string
    [key:string]:any
}
export default (props:IIconWidget)=>{
    const {name='',...argProps} = props
    const src = IconConfig[name]
    return src ? <img src={src} {...(argProps||{})} /> :''
}