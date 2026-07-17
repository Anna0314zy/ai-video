import { Button, Form, Input, Modal, Select } from 'antd'
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
  const [soundEffectOptions, setSoundEffectOptions] = useState<Array<{ label: string; value: number }>>([])
  const [form] = Form.useForm()
  const shotName = currentShot?.shotName || currentShot?.title || (currentShot ? `镜头${currentShot.sort || ''}` : '')
  const shotContent = currentShot?.shotContent || currentShot?.content || ''
  const visualPrompt = currentShot?.visualPrompt || currentShot?.imagePrompt || currentShot?.midjourneyPrompt || ''
  const summary = String(shotContent).replace(/\s+/g, ' ').trim()

  useEffect(() => {
    if (!open) return
    form.setFieldsValue({
      shotName,
      shotContent,
      visualPrompt,
      videoPrompt: currentShot?.videoPrompt || '',
      narration: currentShot?.narration || '',
      soundEffects: currentShot?.soundEffects || '',
      backgroundMusic: currentShot?.backgroundMusic || '',
      soundEffectResourceIds: currentShot?.soundEffectResourceIds || [],
    })
  }, [
    currentShot?.backgroundMusic,
    currentShot?.narration,
    currentShot?.soundEffectResourceIds,
    currentShot?.soundEffects,
    currentShot?.videoPrompt,
    form,
    open,
    shotContent,
    shotName,
    visualPrompt,
  ])

  useEffect(() => {
    if (!open) return
    api
      .getResourceList({ type: 'sound_effect', pageIndex: 1, pageSize: 200 })
      .then(res => {
        const records = Array.isArray(res?.records) ? res.records : []
        setSoundEffectOptions(
          records.map((item: any) => ({
            label: item.name || item.resourceName || basename(item.originPath || item.origin || item.url || `音效${item.resourceId || item.id}`),
            value: Number(item.resourceId || item.id),
          })),
        )
      })
      .catch(() => setSoundEffectOptions([]))
  }, [open])

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
        visualPrompt: values.visualPrompt,
        videoPrompt: values.videoPrompt,
        narration: values.narration,
        soundEffects: values.soundEffects,
        backgroundMusic: values.backgroundMusic,
        soundEffectResourceIds: values.soundEffectResourceIds,
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
          <Form.Item name='visualPrompt' label='图片提示词' rules={[{ required: true, message: '请输入图片提示词' }]}>
            <TextArea rows={4} placeholder='用于生成图片的 prompt' />
          </Form.Item>
          <Form.Item name='videoPrompt' label='视频提示词'>
            <TextArea rows={3} placeholder='用于生成视频运动效果的 prompt' />
          </Form.Item>
          <Form.Item name='narration' label='旁白文本'>
            <TextArea rows={3} placeholder='用于生成旁白的文本' />
          </Form.Item>
          <Form.Item name='soundEffects' label='音效描述'>
            <TextArea rows={2} placeholder='例如：儿童笑声、海浪声、脚踩水花声' />
          </Form.Item>
          <Form.Item name='soundEffectResourceIds' label='素材库音效'>
            <Select
              mode='multiple'
              allowClear
              placeholder='从素材库选择音效'
              options={soundEffectOptions}
              optionFilterProp='label'
            />
          </Form.Item>
          <Form.Item name='backgroundMusic' label='背景音乐描述'>
            <TextArea rows={2} placeholder='例如：轻快、童趣、明亮的国风配乐' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function basename(path: string) {
  return String(path || '').split('/').pop() || path
}
