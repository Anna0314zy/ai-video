import { useState, useEffect } from 'react'

/**
 * 滚动到底部触发事件的hook
 * @param ref 绑定滚动事件的dom节点的ref
 * @param callback 滚动到底部时执行的callback
 * @param reactionDistance 距离底部的触发距离，默认为0
 */
export const useScrollToBottomHook = (
  ref: React.RefObject<HTMLElement> | null,
  reactionDistance = 0,
  callback: () => void,
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false)

  useEffect(() => {
    if (!ref || !ref.current) {
      return
    }

    const currentDom = ref.current

    const handleScroll: any = (e: React.UIEvent<HTMLElement>) => {
      if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.offsetHeight <= reactionDistance) {
        if (!hasReachedBottom) {
          setHasReachedBottom(true)
          callback()
        }
      } else {
        setHasReachedBottom(false)
      }
    }

    currentDom.addEventListener('scroll', handleScroll)

    return () => {
      // Clean up the event listener when the component is unmounted
      currentDom.removeEventListener('scroll', handleScroll)
    }
  }, [callback, reactionDistance, ref, hasReachedBottom])
}
