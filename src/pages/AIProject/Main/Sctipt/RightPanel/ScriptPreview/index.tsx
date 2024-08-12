import { useRef, useImperativeHandle, useState, forwardRef, useCallback } from 'react'
import MarkdownIt from 'markdown-it'
import CommonModal, { ModalHandle } from '@/components/CommonModal'
import { Button } from 'antd'
import DownloadScript from '@/pages/AIProject/components/MaterialItem/DownloadScript'
const ScriptPreview = ({ handleDownload, handleDel, data }: any, ref: any) => {
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
  const btns = [
    {
      key: 'cancel',
      value: '取消',
    },
    {
      key: 'del',
      value: '删除',
    },
    // {
    //   key: 'download',
    //   value: '下载',
    //   type: 'primary',
    // },
  ]
  const handleClick = useCallback(async (key: string) => {
    if (key === 'cancel') {
      modelRef.current?.cancel()
    } else if (key === 'del') {
      await handleDel()
      modelRef.current?.cancel()
    } else if (key === 'download') {
      handleDownload()
    }
  }, [])
  const FooterUi = () => {
    return btns.map(item => {
      return (
        <Button key={item.key} onClick={() => handleClick(item.key)}>
          {item.value}
        </Button>
      )
    })
  }
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
          <FooterUi></FooterUi>
          <DownloadScript data={data}>
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
