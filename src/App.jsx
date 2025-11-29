/**
 * 应用主组件
 * 
 * 该组件是应用的根组件，负责：
 * - 配置路由系统
 * - 提供侧边栏导航
 * - 加载各个页面组件
 * - 集成 Vercel 分析工具
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

// 导入组件
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PriceQuery from './pages/PriceQuery';

// 侧边栏宽度常量
const DRAWER_WIDTH = 240;

/**
 * 创建 Material-UI 主题配置
 * 可以在此处自定义应用的颜色、字体等样式
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

/**
 * 应用主组件
 * @returns {JSX.Element} 应用根组件
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CSS 重置，确保跨浏览器的一致样式 */}
      <CssBaseline />
      
      {/* Vercel 分析工具 */}
      <SpeedInsights />
      <Analytics />

      {/* 路由配置 */}
      <Router>
        <Box sx={{ display: 'flex' }}>
          {/* 侧边栏导航 */}
          <Sidebar />

          {/* 主内容区域 */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
              minHeight: '100vh',
              bgcolor: 'background.default',
            }}
          >
            {/* 路由配置 */}
            <Routes>
              {/* 首页路由 */}
              <Route path="/" element={<Home />} />
              {/* 物价查询页面路由 */}
              <Route path="/price-query" element={<PriceQuery />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;