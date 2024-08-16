import Typed from 'typed.js'
import MarkdownIt from 'markdown-it'
import { convertToMarkdown } from '@/utils/index'

const useTyped = () => {
  function typedText(text: string, containerRef: any, typeRef: any) {
    console.log('zy typedText', text, containerRef?.current)
    const md = new MarkdownIt()
    if (typeRef.current) typeRef.current.destroy()
    if (!containerRef?.current) return
    const html = md.render(convertToMarkdown(text))
    typeRef.current = new Typed(containerRef.current, {
      strings: [html],
      typeSpeed: 0,
    })
    return typeRef.current
  }
  return {
    typedText,
  }
}
export default useTyped
