import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import { getToken, logout } from '@/utils/auth';


const useAuth = ({children}) => {
    
    const dispatch = useDispatch<Dispatch>()
    useEffect(() => {
      initAuth()
    },[])

    const  initAuth = async () => {
      console.log('触发次数')
      const url = new URL(window.location.href)
      const sysToken = url.searchParams.get('token')
      // 如果刚从登录页过来的时候
      if(sysToken) {
        // 存储token 刷新页面
        localStorage.setItem('token', sysToken)
        url.searchParams.delete('token')
        window.history.replaceState(null, '', url.toString())
        return
      }
      // 校验是否有token
      checkUserLoggedIn();
    
    }
    
    const checkUserLoggedIn = () => {
      const token = getToken()
      if(!token) {
        logout()
        return
      }
      // 这里调用接口 校验token
      // 检查用户是否已登录的逻辑
      return true; // 假设用户未登录
    };
    return children
  


};
  
export default useAuth;