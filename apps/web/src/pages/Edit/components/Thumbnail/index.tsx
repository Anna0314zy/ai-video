/*
 * @Date: 2024-07-26 14:26:10
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-29 19:25:03
 * @FilePath: /ai-content-platform/src/pages/Edit/components/Thumbnail/index.tsx
 */
import { Button, Col } from 'antd';
import React from 'react';
import styled from './index.module.less'

const Thumbnail: React.FC = () => {
    return <Col flex="100px">
        <ul className={styled['thumbnail-list']}>
            <li>你好</li>
            <li>你好</li>
            <li>你好</li>
            <li>你好</li>
            <li>你好</li>
        </ul>
    </Col>
}

export default Thumbnail