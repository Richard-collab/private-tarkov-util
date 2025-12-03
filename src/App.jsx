/**
 * 应用主组件
 * 
 * 该组件是应用的根组件，负责：
 * - 配置路由系统
 * - 提供侧边栏导航
 * - 加载各个页面组件
 * - 集成 Vercel 分析工具
 * - 管理主题模式（亮色/暗色）
 */

import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

// 导入组件
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PriceQuery from './pages/PriceQuery';
import TaskFlowDemo from './pages/TaskFlowDemo';

// 侧边栏宽度常量
const DRAWER_WIDTH = 240;

// localStorage 键名
const THEME_MODE_KEY = 'theme-mode';

/**
 * 从 localStorage 获取保存的主题模式
 * @returns {string} 'light' 或 'dark'
 */
const getSavedThemeMode = () => {
  const savedMode = localStorage.getItem(THEME_MODE_KEY);
  return savedMode === 'dark' ? 'dark' : 'light';
};

/**
 * 获取主题配置
 * @param {string} mode - 'light' 或 'dark'
 * @returns {object} Material-UI 主题配置对象
 */
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    ...(mode === 'light'
      ? {
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }
      : {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
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
  // 主题模式状态（'light' 或 'dark'），从 localStorage 读取初始值
  const [mode, setMode] = useState(getSavedThemeMode);

  // 切换主题模式并保存到 localStorage
  const toggleDarkMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_MODE_KEY, newMode);
      return newMode;
    });
  };

  // 使用 useMemo 缓存主题配置，避免不必要的重新创建
  const theme = useMemo(() => getTheme(mode), [mode]);

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
          <Sidebar darkMode={mode === 'dark'} toggleDarkMode={toggleDarkMode} />

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
              {/* 任务流程页面路由 */}
              <Route path="/task-flow" element={<TaskFlowDemo />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;