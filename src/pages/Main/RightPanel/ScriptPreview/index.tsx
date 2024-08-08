import { useRef, useImperativeHandle, useState, forwardRef } from 'react'
import MarkdownIt from 'markdown-it'
import CommonModal, { ModalHandle } from '@/components/CommonModal'
const ScriptPreview = (_: any, ref: any) => {
  const modelRef = useRef<ModalHandle>(null)
  const [html, setHtml] = useState('')
  const cancel = () => {}
  const open = (text: string) => {
    modelRef.current?.open()
    const md = new MarkdownIt()
    console.log('text', `${text}`)
    const html = md.render(text)
    setHtml(html)
  }
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    open,
  }))
  return (
    <CommonModal
      ref={modelRef}
      title='新建项目'
      destroyOnClose={true}
      okText='确定'
      cancelText='取消'
      onOk={async () => {}}
      onCancel={cancel}>
      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}></div>
    </CommonModal>
  )
}
export default forwardRef(ScriptPreview)
