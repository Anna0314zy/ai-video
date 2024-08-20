import { useRef, useImperativeHandle, useState, forwardRef, useCallback } from 'react'
import MarkdownIt from 'markdown-it'
import CommonModal, { ModalHandle } from '@/components/CommonModal'
import { Button } from 'antd'
import DownloadScript from '../DownloadScript'
const ScriptPreview = ({ handleDownload, handleDel, data }: any, ref: any) => {
  const modelRef = useRef<ModalHandle>(null)
  const [html, setHtml] = useState('')
  const cancel = () => {}
  const open = (text: string) => {
    modelRef.current?.open()
    const md = new MarkdownIt()
    console.log('text', `${text}`)
    const html = md.render(text)
    console.log('%c 🚀 ~ [ html ]-15', 'font-size:14px; background:green; color:#fff;', html)
    setHtml(html)
  }
  // 绑定ref对外引用
  useImperativeHandle(ref, () => ({
    open,
  }))

  const handleClick = useCallback(async (key: string) => {
    switch (key) {
      case 'cancel':
        modelRef.current?.cancel()
        break
      case 'del':
        await handleDel()
        modelRef.current?.cancel()
        break
      case 'download':
        handleDownload()

        break
    }
  }, [])

  return (
    <CommonModal
      ref={modelRef}
      width={'80%'}
      height={'80%'}
      title='预览'
      destroyOnClose={true}
      okText='确定'
      cancelText='取消'
      onOk={async () => {}}
      onCancel={cancel}
      footer={
        <>
          <Button key={'cancel'} onClick={() => handleClick('cancel')}>
            取消
          </Button>
          <Button key={'del'} onClick={() => handleClick('del')}>
            删除
          </Button>
          <DownloadScript data={data} key={'download'}>
            <Button type={'primary'}>下载</Button>
          </DownloadScript>
        </>
      }>
      <div
        style={{ minHeight: '500px' }}
        dangerouslySetInnerHTML={{
          __html: html,
        }}></div>
    </CommonModal>
  )
}
export default forwardRef(ScriptPreview)
