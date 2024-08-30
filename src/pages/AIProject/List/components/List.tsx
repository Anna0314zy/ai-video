import { useCallback, useRef, useState } from 'react'
import { Flex, Table, Button, Tag } from 'antd'
import type { TableProps } from 'antd'
import CreateProjectBtn from './CreateProjectBtn'
import { MinusOutlined } from '@ant-design/icons'
import Styles from '../index.module.less'
import IconWidget from '@/components/IconWidget/index'
import { PageList, ProjectList } from '@/api/models/project'
import UserOutlined from '@ant-design/icons/lib/icons/UserOutlined'
import { v3 as uuidv3 } from 'uuid'
import { ScriptStatus } from '@/api/types/script'
import { EditOutlined, CheckCircleOutlined, CheckCircleTwoTone } from '@ant-design/icons'
import AntdIcon from '@/components/IconWidget/AntdIcon'
import { useSize } from 'ahooks'
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
  delProject,
}: {
  data: PageList
  getList: (params?: { current: number; size: number }) => void
  delProject: (keys: any) => void
}) => {
  const windowUrl = useRef<any>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const handleClick = useCallback((record: ProjectList, val: 'edit') => {
    const MY_NAMESPACE = '123e4567-e89b-12d3-a456-426614174000'
    const windowName = uuidv3(record.projectName + record.id, MY_NAMESPACE)
    let sessionId = 0
    if (record.sessionList?.length) sessionId = record.sessionList[record.sessionList?.length - 1].id
    const query = `projectName=${record.projectName}&subjectName=${record.subjectName}&returnUrl=${encodeURIComponent(
      window.location.href,
    )}`
    let hashBase = `#/project/${record.id}/${record.state === 'ScriptProcessing' ? 'script' : 'video'}`
    const url = `${window.location.origin + window.location.pathname}?${query}${hashBase}`
    if (windowUrl.current[windowName]) {
      windowUrl.current[windowName].focus()
    }
    // 打开或聚焦具有相同名称的窗口
    windowUrl.current[windowName] = window.open(url, windowName)
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
      dataIndex: 'projectNo',
      align: 'center',
      width: 160,
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
      title: '状态',
      dataIndex: 'state',
      align: 'center',
      render: (_, record: ProjectList) => {
        if (record.state === 'Completed') {
          return (
            <Tag style={{ color: '#24CA49' }} color='rgba(36, 202, 73, 0.1)' icon={<AntdIcon icon='checkCircle' />}>
              {ScriptStatus[record.state]}{' '}
            </Tag>
          )
        }
        return (
          <Tag style={{ color: '#FF7A2F' }} color='rgba(254, 126, 7, 0.1)' icon={<EditOutlined />}>
            {ScriptStatus[record.state]}{' '}
          </Tag>
        )
      },
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      align: 'center',
      width: 200,
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
  // delProject
  const wrapper = useRef<HTMLDivElement>(null)
  const wrapperSize = useSize(wrapper)
  const tableHeaderSize = useSize(document.querySelector('#home-ai-project .ant-table-header'))
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  return (
    <>
      <div className={Styles['home-layout']} id='home-ai-project'>
        <Flex className='home-header' justify='space-between' align='center'>
          <div className='home-title'>我的项目</div>
          <div>
            <Button
              type='primary'
              onClick={() => {
                delProject(selectedRowKeys)
              }}>
              <MinusOutlined size={16} />
              删除项目
            </Button>
            &nbsp;
            <CreateProjectBtn />
          </div>
        </Flex>
        <div className={Styles['table-content']} ref={wrapper}>
          <Table
            size='small'
            columns={columns}
            rowKey='id'
            dataSource={data.records || []}
            scroll={{
              y: (wrapperSize?.height || 300) - (tableHeaderSize?.height || 50) - 24 - 32,
              x: 1000,
            }}
            rowSelection={rowSelection}
            onRow={record => ({
              onClick: () => handleClick(record, 'edit'),
            })}
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
      </div>
    </>
  )
}
