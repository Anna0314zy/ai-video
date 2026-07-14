import React, { useEffect, useRef } from 'react'
import { isEqual } from 'lodash-es'
export const useDeepCompareEffect = (fn: any, deps: any) => {
  const currentRef = useRef()

  if (!isEqual(currentRef.current, deps)) {
    currentRef.current = deps
  }

  useEffect(fn, [currentRef.current])
}
