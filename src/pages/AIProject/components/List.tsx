import { useCallback } from 'react'
import { Flex, Table, Button } from 'antd'
import type { TableProps } from 'antd'
import CreateProjectBtn from './CreateProjectBtn'
import Styles from '../../Home/index.module.less'
import IconWidget from '@/components/IconWidget/index'
import { PageList, ProjectList } from '@/api/models/project'
import UserOutlined from '@ant-design/icons/lib/icons/UserOutlined'
import { v3 as uuidv3 } from 'uuid'
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
export default ({
  data,
  getList,
}: {
  data: PageList
  getList: (params?: { current: number; size: number }) => void
}) => {
  const handleClick = useCallback((record: ProjectList, val: 'edit') => {
    const MY_NAMESPACE = '123e4567-e89b-12d3-a456-426614174000'
    const windowName = uuidv3(record.projectName + record.id, MY_NAMESPACE)
    console.log('%c zy handleClick', 'color:red', windowName, record.sessionList)
    let sessionId = 0
    if (record.sessionList?.length) sessionId = record.sessionList[record.sessionList?.length - 1].id

    const url = `${window.location.origin}?projectName=${record.projectName}&subjectName=${record.subjectName}&sessionId=${sessionId}&type=1/#/project/${record.id}/text`

    // 打开或聚焦具有相同名称的窗口
    window.open(url, '_blank')
  }, [])

  const columns: TableProps<ProjectList>['columns'] = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      align: 'center',
      width: 300,
      render(text) {
        return (
          <Flex>
            <IconWidget name='excel' width={24} height={24} style={{ marginLeft: '5px' }} />
            <div>{text}</div>
          </Flex>
        )
      },
    },
    {
      title: 'ID编号',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: '学科',
      dataIndex: 'subjectName',
      align: 'center',
    },
    {
      title: '年级',
      dataIndex: 'gradeName',
      align: 'center',
    },
    {
      title: '季度',
      dataIndex: 'termName',
      align: 'center',
    },
    {
      title: '创建人',
      dataIndex: 'username',
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Flex justify='center' align='center'>
          <Button type='link' onClick={() => handleClick(record, 'edit')}>
            编辑
          </Button>
        </Flex>
      ),
    },
  ]

  return (
    <>
      <div className={Styles['home-layout']}>
        <Flex className='home-header' justify='space-between' align='center'>
          <div className='home-title'>我的项目</div>
          <CreateProjectBtn />
        </Flex>
        <Table
          columns={columns}
          rowKey='id'
          dataSource={data.records || []}
          pagination={{
            total: data.total,
            current: data.current,
            pageSize: data.size,
            position: ['bottomCenter'],
            hideOnSinglePage: true,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal(total) {
              return `共 ${total} 条记录`
            },
            onChange: (page, pageSize) => {
              getList({
                current: page,
                size: pageSize,
              })
            },
          }}
        />
      </div>
    </>
  )
}
