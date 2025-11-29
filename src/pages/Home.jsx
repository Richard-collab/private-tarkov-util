/**
 * 首页组件
 * 
 * 该组件展示应用的欢迎页面，显示 "Private Tarkov Util" 标题
 * 以及用户收藏的物品
 * 
 * 这是应用的主入口页面
 */

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FavoritedItems from '../components/FavoritedItems';

/**
 * 首页组件
 * @returns {JSX.Element} 首页内容
 */
const Home = () => {
  return (
    <Container maxWidth="xl">
      {/* 收藏物品区域 - 显示在页面顶部 */}
      <Box sx={{ mt: 2 }}>
        <FavoritedItems />
      </Box>

      {/* 页面主要内容区域 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        {/* 应用标题 */}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2,
          }}
        >
          Private Tarkov Util
        </Typography>
        {/* 副标题描述 */}
        <Typography variant="h6" color="text.secondary">
          塔科夫游戏工具集
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
