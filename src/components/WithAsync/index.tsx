import React, { ReactNode, PropsWithoutRef, Suspense } from 'react'
import { Spin } from 'antd'

export default function WithAsync<T>(
  loader: () => Promise<{
    default: any
  }>,
) {
  function WithAsync(props: PropsWithoutRef<T & { children?: ReactNode }>) {
    const Component = React.lazy(loader)
    return (
      <Suspense fallback={<div style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}><Spin size="large"/></div>}>
        <Component {...props}>{props.children}</Component>
      </Suspense>
    )
  }
  return React.memo(WithAsync)
}
