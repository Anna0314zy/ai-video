import React, { useEffect } from 'react'
import { setToken } from '@/utils/auth'
const useAuth = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const url = new URL(window.location.href)
    const sysToken = url.searchParams.get('token')
    if (sysToken) {
      setToken(sysToken)
      url.searchParams.delete('token')
      window.history.replaceState(null, '', url.toString())
    }
  }, [])

  return children
}

export default useAuth
