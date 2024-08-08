import { useContext } from 'react'
import { useRef } from 'react'
import { MyContext } from '../index'
import Typed from 'typed.js'
import MarkdownIt from 'markdown-it'
const useTyped = () => {
  const { containerRef, getChatHistories } = useContext(MyContext)
  const typeRef = useRef<any>()
  const handleComplete = async () => {
    console.log('完成打字')
    await getChatHistories()
    typeRef.current?.destroy()
    console.log('Typing complete!')
  }
  function typedText(text: string) {
    console.log('zy typedText', text, containerRef.current)
    const md = new MarkdownIt()
    const html = md.render(typeof text === 'string' ? text : '')
    if (typeRef.current) typeRef.current.destroy()
    typeRef.current = new Typed(containerRef.current, {
      strings: [html],
      typeSpeed: 50,
      // showCursor: false, // 隐藏光标
      onComplete: handleComplete,
    })
  }
  return {
    typedText,
    destroy: () => {
      typeRef.current?.destroy()
    },
  }
}
export default useTyped
