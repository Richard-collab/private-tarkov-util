/**
 * 侧边栏导航组件
 * 
 * 该组件提供应用的主要导航功能，包含：
 * - 应用标题/Logo区域
 * - 导航菜单项列表
 * - 可折叠/展开功能（响应式设计）
 * - 夜间模式切换按钮
 * 
 * 使用 Material-UI 的 Drawer 组件实现
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';

// 侧边栏固定宽度
const DRAWER_WIDTH = 240;

/**
 * 导航菜单项配置
 * 每个菜单项包含：
 * - text: 显示文本
 * - icon: 图标组件
 * - path: 路由路径
 */
const menuItems = [
  {
    text: '首页',
    icon: <HomeIcon />,
    path: '/',
  },
  {
    text: '物价查询',
    icon: <SearchIcon />,
    path: '/price-query',
  },
  {
    text: '任务流程',
    icon: <AccountTreeIcon />,
    path: '/task-flow',
  },
];

/**
 * 侧边栏组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.darkMode - 当前是否为夜间模式
 * @param {Function} props.toggleDarkMode - 切换夜间模式的函数
 * @returns {JSX.Element} 侧边栏导航组件
 */
const Sidebar = ({ darkMode, toggleDarkMode }) => {
  // 路由导航钩子
  const navigate = useNavigate();
  // 获取当前路由位置
  const location = useLocation();

  /**
   * 处理菜单项点击事件
   * @param {string} path - 目标路由路径
   */
  const handleMenuClick = (path) => {
    navigate(path);
  };

  /**
   * 判断当前菜单项是否为活动状态
   * @param {string} path - 菜单项路径
   * @returns {boolean} 是否为当前活动路由
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* 顶部工具栏区域 - 应用标题 */}
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        >
          塔科夫工具
        </Typography>
      </Toolbar>

      <Divider />

      {/* 导航菜单列表 */}
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                selected={isActive(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {/* 菜单图标 */}
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {/* 菜单文本 */}
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 'bold' : 'regular',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 底部区域 - 夜间模式切换和版权信息 */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* 夜间模式切换按钮 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <Tooltip title={darkMode ? '切换到亮色模式' : '切换到夜间模式'}>
            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              aria-label="切换夜间模式"
              sx={{
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Typography
            variant="body2"
            sx={{ ml: 1 }}
          >
            {darkMode ? '亮色模式' : '夜间模式'}
          </Typography>
        </Box>

        {/* 版权信息 */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © 2024 塔科夫工具
        </Typography>
      </Box>
    </Drawer>
  );
};

// 导出侧边栏宽度常量，供其他组件使用
export default Sidebar;
