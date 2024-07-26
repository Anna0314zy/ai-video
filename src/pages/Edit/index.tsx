/*
 * @Date: 2024-07-24 18:53:06
 * @LastEditors: wangpeng
 * @LastEditTime: 2024-07-26 18:15:34
 * @FilePath: /ai-content-platform/src/pages/Edit/index.tsx
 */
import { useParams } from 'react-router-dom';
import { Button, Layout } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';

const { Header, Footer, Sider, Content } = Layout;
const Edit: React.FC = () => {
    let { id } = useParams();
    return <div style={{height: '100%'}}>
    <Header style={{height: '50px',textAlign: 'center'}}>
        <Button>图片</Button>
        <Button>视频</Button>
        <Button>音频</Button>
    </Header>
    <Outlet/>
  </div>
}

export default Edit