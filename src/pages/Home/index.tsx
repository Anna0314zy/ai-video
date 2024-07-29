import { useEffect, useState } from 'react'
import { Flex, Space, Table, Tag, Result } from 'antd'
import type { TableProps } from 'antd'
import CreateProject from '@/components/CreateProject'
import Styles from './index.module.less'

interface DataType {
  key: string
  name: string
  age: number
  address: string
  tags: string[]
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    align:"center",
    render(text){
      return text
    }
  },
  {
    title: 'ID编号',
    dataIndex: 'id',
    key: 'id',
    align:"center",
  },
  {
    title: '学科',
    dataIndex: 'subject',
    key: 'subject',
    align:"center",
  },
  {
    title: '年级',
    dataIndex: 'grade',
    key: 'grade',
    align:"center",
  },
  {
    title: '季度',
    dataIndex: 'stem',
    key: 'stem',
    align:"center",
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator',
    align:"center",
  },
  {
    title: '修改时间',
    dataIndex: 'modefiy_time',
    key: 'modefiy_time',
    align:"center",
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size='middle'>
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
]

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
]

export default () => {
  const [tableData, setTableData] = useState([])
  useEffect(()=>{

  },[])

  return (
    <>
      {tableData.length ? (
        <div className={Styles['home-layout']}>
          <Flex className='home-header' justify='space-between' align='center' style={{ marginBottom: '10px' }}>
            <div className='home-title'>我的项目</div>
            <CreateProject />
          </Flex>
          <Table columns={columns} dataSource={data} pagination={{ hideOnSinglePage: true }} />
        </div>
      ) : (
        <div className={Styles['result-empty']}>
          <div className='result-empty-content'>
            <img className='empty-img' src={require("@/assets/images/empty.png")}/>
            <div className='empty-text'>空空如也，什么也没有，快去创建吧～</div>
            <CreateProject />
          </div>
        </div>
      )}
    </>
  )
}
