import { FC, useState } from 'react'
import { Layout } from 'antd'
import StoryboardCard from '../StoryboardCard'
import ContentMenu from './modules/RightClick'
import DragList from './DragList'
export default () => {
  const list = new Array(20).fill(0).map((v, idx) => ({
    ...v,
    id: idx + 1,
  }))
  return (
    <Layout.Sider className='page-storyboard-left'>
      <div className='page-storyboard-left__header'>
        <span>共32个镜头</span>
        <span>新建镜头</span>
      </div>
      <ContentMenu>
        <DragList />
      </ContentMenu>
    </Layout.Sider>
  )
}
