import { useCallback, useEffect, useState, useRef } from 'react'
import { Flex, Table, Button, Divider, Dropdown, Layout, Menu } from 'antd'
import type { TableProps } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import Styles from '../Home/index.module.less'
import IconWidget from '@/components/IconWidget/index'
import { useNavigate } from 'react-router-dom'
import { PageList, projectList, ProjectList } from '@/api/models/project'
import UserOutlined from '@ant-design/icons/lib/icons/UserOutlined'
import List from './components/List'
import Empty from './components/Empty'
import MyContext from './context'
interface DataType {
  key: string
  name: string
  age: number
  address: string
  tags: string[]
}
const menuData = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: '我的工程',
  },
]
interface SearchParams {
  current: number
  size: number
}
export default () => {
  const [data, setData] = useState<PageList>({
    records: [],
    current: 0,
    size: 0,
    total: 0,
  })
  const navigate = useNavigate()
  const searchParams = useRef<SearchParams>({
    current: 1,
    size: 10,
  })
  const getList = useCallback(async (params?: { current?: number; size?: number }) => {
    const { current, size } = params || {}
    const res = await projectList({
      current: current || searchParams.current.current,
      size: size || searchParams.current.size,
    })
    setData(res)
  }, [])

  useEffect(() => {
    getList()
  }, [])

  return (
    <MyContext.Provider
      value={{
        getList,
      }}>
      {data?.records?.length ? <List data={data} getList={getList} /> : <Empty />}
    </MyContext.Provider>
  )
}
