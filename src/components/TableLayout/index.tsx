import { Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import { useEffect, useState, useRef } from 'react'

const TableLayout: React.FC<TableProps> = props => {
  const [tableTop, setTableTop] = useState(0)
  const tableRef = useRef(null)
  useEffect(() => {
    setTimeout(() => {
      const tableHead = (tableRef.current as any)?.querySelector('.ant-table-thead')?.getBoundingClientRect()
      setTableTop((tableHead?.top || 0) + (tableHead?.height || 0))
    }, 0)
  }, [])
  return (
    <Table
      ref={tableRef}
      size='middle'
      scroll={{ x: `calc(100vh - 64px)` }}
      pagination={props.pagination || false}
      {...props}
    />
  )
}

export default TableLayout
