import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/store'
import { getToken } from '@/utils/auth';


const useAuth = () => {
    
    const dispatch = useDispatch<Dispatch>()
    
    useEffect(() => {
      const  initAuth = async () => {
        console.log('触发次数')
        const url = new URL(window.location.href)
        const sysToken = url.searchParams.get('sysToken')
        // 如果刚从登录页过来的时候
        if(sysToken) {
          // 存储token 刷新页面
          localStorage.setItem('systemToken', sysToken)
          url.searchParams.delete('sysToken')
          window.history.replaceState(null, '', url.toString())
          return
        }

        const isLoggedIn = await checkUserLoggedIn();
        if(isLoggedIn) {
          dispatch.auth.updateToken('xxxxx')
        }
      }
      initAuth()
      
    }, []);
  
    const checkUserLoggedIn = () => {
      const token = getToken()
      if(!token) {
        console.log('跳转到登录页')
        return
      }
      // 这里调用接口 校验token
      // 检查用户是否已登录的逻辑
      return true; // 假设用户未登录
    };

  };
  
  export default useAuth;