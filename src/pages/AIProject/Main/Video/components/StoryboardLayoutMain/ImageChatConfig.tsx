import { useImperativeHandle, forwardRef, useEffect, useState, useMemo } from 'react'
import { ImageDesign, ImageConfig } from '@/pages/AIProject/components/config'
import { WidgetItem } from '@/pages/AIProject/components/WidgetInputItem'
import { Flex, Form, Space } from 'antd'
import { ImageChatParams } from '@/api/types/video'
import * as api from '@/api/models/aiVideo'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
const ImageChatConfig = (_: any, ref: any) => {
  const { currentShotId } = useSelector((state: RootState) => state.aiVideo)

  const [btnList, setBtnList] = useState<
    {
      btnType: string
      btnName: string
      btnValue?: string
    }[]
  >([])

  const [typeList, setTypeList] = useState<{ value: string; label: string }[]>([])
  const getImagePromptBtnList = async () => {
    if (!currentShotId) return
    const res = await api.getImagePromptBtnList(currentShotId)
    console.log('res-----', res)
    setBtnList(res)
    setTypeList(res.map(v => ({ value: v.btnName, label: v.btnName })))
  }
  useEffect(() => {
    getImagePromptBtnList()
  }, [currentShotId])

  const [form] = Form.useForm()
  useImperativeHandle(ref, () => ({
    form,
    btnList,
  }))
  function generateRandom18DigitNumber() {
    // 生成一个18位的随机数字
    const randomNumber = (Math.random() * 1e18).toFixed(0)

    // 确保结果是18位数，不足18位则前面填充0
    return randomNumber.padEnd(18, '0')
  }
  useEffect(() => {
    form.setFieldsValue({ seed: generateRandom18DigitNumber(), fps: 6 })
  }, [])

  const config: ImageConfig[] = useMemo(() => {
    return ImageDesign.map(v => {
      if (v.prop === 'category') {
        v.options = btnList.map(item => ({
          label: item.btnName,
          value: item.btnName,
          type: item.btnType,
        }))
      }
      return v
    })
  }, [btnList])
  console.log(config, 'config')
  return (
    <Form form={form} name='basic' labelAlign='left' layout='vertical' initialValues={{}} autoComplete='off'>
      <Flex wrap={true}>
        <Space style={{ display: 'flex', flexWrap: 'wrap' }}>
          {config.map(item => {
            return (
              <Form.Item<ImageChatParams> label={item.label} name={item.prop} key={item.prop}>
                {WidgetItem({ data: item })}
              </Form.Item>
            )
          })}
        </Space>
      </Flex>
    </Form>
  )
}
export default forwardRef(ImageChatConfig)
