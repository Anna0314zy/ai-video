/*
 * @Date: 2024-07-26 14:24:58
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-26 14:45:54
 * @FilePath: /ai-content-platform/src/pages/Edit/components/Video/index.tsx
 */
import { useParams } from 'react-router-dom';
import { Button, Layout } from 'antd';
import React from 'react';
import Thumbnail from '../Thumbnail';

const { Content } = Layout;
const Video: React.FC = () => {
    let { id } = useParams();
    return <Layout>
        <Thumbnail />
        <Content>
            视频详情区
        </Content>
    </Layout>
}

export default Video