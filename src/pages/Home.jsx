/**
 * 首页组件
 * 
 * 该组件展示物品列表的主页面，包含：
 * - 搜索栏：用于过滤显示的物品
 * - 物品卡片列表：展示物品的基本信息和价格
 * 
 * 这是从原 App.jsx 中提取出来的主要内容
 */

import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ListBasicItemCard from '../components/ListBasicItemCard';
import SearchBar from '../components/SearchBar';

/**
 * 首页组件
 * @returns {JSX.Element} 首页内容
 */
const Home = () => {
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');

  return (
    <Container maxWidth="xl">
      {/* 页面标题 */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          物品列表
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          按24小时平均价格排序的物品列表
        </Typography>
      </Box>

      {/* 搜索栏 */}
      <SearchBar onSearch={(kw) => setSearchKeyword(kw)} />

      {/* 物品卡片列表 */}
      <ListBasicItemCard n={20} ascending={false} keyword={searchKeyword} />
    </Container>
  );
};

export default Home;
