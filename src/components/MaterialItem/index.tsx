import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget'
import { MoreOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { ScriptPageList } from '@/api/type'
import { Flex, Space, Button } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import * as api from '@/api/models/main'
import { downloadFromServer } from '@/utils'
interface IMaterialItem {
  data: ScriptPageList // 素材数据
  icon?: string // 素材icon
  actived?: boolean // 选中状态
  handleClick: (val: ScriptPageList) => void
}
export default (props: IMaterialItem) => {
  const { data } = props

  // 下载
  const handleDownload = useCallback(() => {
    const url = `${import.meta.env.VITE_API_SERVER}/api/text/v1/downloadScript?scriptId=${data.scriptId}&ext=xlsx`
    downloadFromServer(url)
  }, [])

  return (
    <Flex
      className={classNames(Styles['material-item'], {
        [Styles.actived]: data.actived,
      })}
      onClick={() => props.handleClick(props.data)}>
      <IconWidget className='material-icon' name={props.icon} width={24} height={24} style={{ marginRight: '10px' }} />
      <Flex className='material-content' align='flex-start' flex={1} vertical={true}>
        <span className='material-content'>{data?.scriptStyle}</span>
        <span>{dayjs(Date.now()).format('YYYY-MM-DD HH:mm')}</span>
      </Flex>
      <div className='material-item-right'>
        <Space>
          <Button type='link' icon={<ArrowDownOutlined />} className={Styles['btn']} onClick={handleDownload}></Button>
          <Button type='link' className={Styles.btn} icon={<MoreOutlined className='material-more' />}></Button>
        </Space>
      </div>
    </Flex>
  )
}
