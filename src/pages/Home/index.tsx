  import { useCallback, useEffect, useState } from 'react'
import { Flex, Table, Button,Divider,Dropdown } from 'antd'
import type { TableProps } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import CreateProject from '@/components/CreateProject'
import Styles from './index.module.less'
import IconWidget from '@/components/IconWidget/index'
import { useNavigate } from 'react-router-dom'
import {projectList} from '@/api/models/home'

interface DataType {
  key: string
  name: string
  age: number
  address: string
  tags: string[]
}




export default () => {
  const [tableData, setTableData] = useState<any[]>([])
  const navigate = useNavigate()

  const getPageList = useCallback(async ()=>{
    const res = await projectList({
      current:1,
      size:20,
    })
    console.log('getPageList',res)
    return {
      total:80,
      list:[]
    }
  },[])

  useEffect(()=>{
    getPageList()
    setTableData([
      {
        name:"高尔基的童年",
        id:32,
        subject:'语文',
        grade:'三年级',
        季度:'夏季',
        creator:'Admin',
        modefiy_time:'2024.07.29 15:18'
      },
      {
        name:"高尔基的童年",
        id:33,
        subject:'语文',
        grade:'三年级',
        季度:'夏季',
        creator:'Admin',
        modefiy_time:'2024.07.29 15:18'
      }
    ])
  },[])

  

  const columns: TableProps<DataType>['columns'] = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      align:"center",
      width:300,
      render(text){
        return <Flex>
          <IconWidget name='excel' width={24} height={24} style={{marginLeft:'5px'}}/>
          <div>{text}</div>
        </Flex>
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
      align:"center",
      render: (_, record) => (
        <Flex justify='center' align="center">
          <Button type="link" onClick={()=>{}}>查看</Button>
          <Divider type="vertical"></Divider>
          <Button type="link" onClick={()=>{
            navigate(`/edit/${record.id}?projectName=${record.name}&type=2`)
          }}>预览</Button>
          <Divider type="vertical"></Divider>
          <Button type="link" onClick={()=>{
            navigate(`/edit/${record.id}/home?projectName=${record.name}&type=1`)
          }}>编辑</Button>
          <Divider type="vertical"></Divider>
          <Button type="link" onClick={()=>{}}>删除</Button>
          <Divider type="vertical"></Divider>
          <Dropdown menu={{ items:[{key: '1',
      label: '1st item',}] }} placement='bottomRight' trigger={['click']}><EllipsisOutlined /></Dropdown>
        </Flex>
      ),
    },
  ]

  return (
    <>
      {tableData.length ? (
        <div className={Styles['home-layout']}>
          <Flex className='home-header' justify='space-between' align='center'>
            <div className='home-title'>我的项目</div>
            <CreateProject />
          </Flex>
          <Table columns={columns} dataSource={tableData} pagination={{ 
            total:85,
            position:["bottomCenter"],
            hideOnSinglePage: true,
            showSizeChanger:true,
            showQuickJumper:true,
            showTotal(total){return `共 ${total} 条记录`}
          }} />
        </div>
      ) : (
        <div className={Styles['result-empty']}>
          <div className='result-empty-content'>
            <div className='empty-img'></div>
            <div className='empty-text'>空空如也，什么也没有，快去创建吧～</div>
            <CreateProject />
          </div>
        </div>
      )}
    </>
  )
}
