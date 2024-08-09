/*
 * @Date: 2024-07-26 14:24:58
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-26 15:25:58
 * @FilePath: /ai-content-platform/src/pages/Edit/components/Image/index.tsx
 */
import { useParams } from 'react-router-dom'
import { Row, Col } from 'antd'
import React from 'react'
import Thumbnail from '../Thumbnail'

const Image: React.FC = () => {
  let { id } = useParams()
  return (
    <Row style={{ height: 'calc(100% - 50px)' }}>
      <Thumbnail />
      <Col flex='auto'>图片详情区</Col>
    </Row>
  )
}

export default Image
