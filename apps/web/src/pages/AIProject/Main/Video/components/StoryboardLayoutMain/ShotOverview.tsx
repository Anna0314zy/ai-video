import { Button, Form, Input, Modal } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import * as api from '@/api/models/aiVideo'
import { Dispatch, RootState } from '@/store'

const { TextArea } = Input

export default function ShotOverview() {
  const dispatch = useDispatch<Dispatch>()
  const projectId = Number(useParams().id)
  const { currentShotId, shotList } = useSelector((state: RootState) => state.aiVideo)
  const currentShot = useMemo(() => {
    return shotList.find(item => item.shotId === currentShotId)
  }, [currentShotId, shotList])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const shotName = currentShot?.shotName || currentShot?.title || (currentShot ? `镜头${currentShot.sort || ''}` : '')
  const shotContent = currentShot?.shotContent || currentShot?.content || ''
  const summary = String(shotContent).replace(/\s+/g, ' ').trim()

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      shotName,
      shotContent,
    })
  }, [form, open, shotContent, shotName])

  const handleSave = async () => {
    if (!currentShot) return
    const values = await form.validateFields()
    setSaving(true)
    try {
      const updated = await api.updateShot({
        projectId,
        shotId: currentShot.shotId,
        shotName: values.shotName,
        shotContent: values.shotContent,
      })
      dispatch.aiVideo.updateData({
        shotList: shotList.map(item => (item.shotId === updated.shotId ? { ...item, ...updated } : item)),
        selectedShot: { ...currentShot, ...updated },
      })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!currentShot) return null

  return (
    <>
      <div
        style={{
          borderBottom: '1px solid #eef0f4',
          padding: '10px 16px',
          background: '#fff',
          color: '#202432',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 58,
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{shotName}</span>
            <span style={{ color: '#8a90a2', fontSize: 12 }}>镜头内容</span>
          </div>
          <div
            title={shotContent}
            style={{
              color: '#5d6475',
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {summary || '暂无镜头内容'}
          </div>
        </div>
        <Button size='small' onClick={() => setOpen(true)}>
          编辑镜头
        </Button>
      </div>

      <Modal
        title='编辑镜头'
        open={open}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        okText='保存'
        cancelText='取消'
        width={640}>
        <Form form={form} layout='vertical'>
          <Form.Item name='shotName' label='镜头标题' rules={[{ required: true, message: '请输入镜头标题' }]}>
            <Input placeholder='请输入镜头标题' />
          </Form.Item>
          <Form.Item name='shotContent' label='镜头内容' rules={[{ required: true, message: '请输入镜头内容' }]}>
            <TextArea rows={8} placeholder='请输入镜头内容' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
