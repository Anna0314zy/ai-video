import MaterialItem from '@/components/MaterialItem'
import IconWidget from '@/components/IconWidget'
import { MoreOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { ScriptPageList } from '@/api/type'
import { Flex, Space, Button } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { key } from 'localforage'
import classNames from 'classnames'
export default ({ data, handleChoose }: any) => {
  return <MaterialItem icon='excel' data={data} handleClick={handleChoose} />
}
