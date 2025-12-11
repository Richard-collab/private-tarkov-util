/**
 * 任务物品收集页面
 * 
 * 该组件统计并显示所有任务中需要在战局拾取并提交的物品
 * 包括物品图片、名称和所需总数量
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

// 导入任务数据
import { getAllTasks } from '../data/TaskData';
// 导入物品数据
import itemsData from '../data/items.json';

/**
 * 从所有任务中提取需要在战局拾取的物品
 * @returns {Array} 物品数组，每个元素包含 itemId, itemName, totalCount, imageUrl
 */
const extractQuestItems = () => {
  const tasks = getAllTasks();
  const itemsMap = new Map();

  // 创建物品ID到图片URL的映射
  const itemImageMap = new Map();
  itemsData.items.forEach((item) => {
    itemImageMap.set(item.id, item.image8xLink);
  });

  // 遍历所有任务
  tasks.forEach((task) => {
    // 遍历任务目标
    task.objectives.forEach((objective) => {
      // 只处理 giveItem 类型的目标
      if (objective.type === 'giveItem' && objective.item) {
        // 检查描述中是否包含"在战局中"或"found in raid"
        const isFindInRaid =
          objective.description.includes('在战局中找到') ||
          objective.description.includes('found in raid');

        if (isFindInRaid) {
          // 从objective中获取物品信息
          const itemId = objective.item.id;
          const itemName = objective.item.name;

          if (itemsMap.has(itemId)) {
            // 如果物品已存在，累加数量
            itemsMap.get(itemId).totalCount += objective.count || 1;
          } else {
            // 新物品，添加到Map
            itemsMap.set(itemId, {
              itemId,
              itemName,
              totalCount: objective.count || 1,
              imageUrl: itemImageMap.get(itemId) || '',
            });
          }
        }
      }
    });
  });

  return Array.from(itemsMap.values());
};

/**
 * 任务物品收集页面组件
 * @returns {JSX.Element} 任务物品收集页面
 */
const QuestItems = () => {
  // 排序方式：'count' 按数量排序，'name' 按名称排序
  const [sortBy, setSortBy] = useState('count');

  // 提取并处理物品数据
  const questItems = useMemo(() => extractQuestItems(), []);

  // 根据排序方式排序物品
  const sortedItems = useMemo(() => {
    const items = [...questItems];
    if (sortBy === 'count') {
      // 按数量降序排序
      items.sort((a, b) => b.totalCount - a.totalCount);
    } else if (sortBy === 'name') {
      // 按名称排序
      items.sort((a, b) => a.itemName.localeCompare(b.itemName, 'zh-CN'));
    }
    return items;
  }, [questItems, sortBy]);

  /**
   * 处理排序方式改变
   * @param {Event} event - 事件对象
   * @param {string} newSortBy - 新的排序方式
   */
  const handleSortChange = (event, newSortBy) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* 页面标题区域 */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          任务物品收集统计
        </Typography>
        <Typography variant="body1" color="text.secondary">
          显示所有任务中需要在战局拾取并提交的物品及其数量
        </Typography>
      </Box>

      {/* 控制栏 - 排序选项 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SortIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            排序方式：
          </Typography>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            aria-label="排序方式"
            size="small"
          >
            <ToggleButton value="count" aria-label="按数量排序">
              按数量
            </ToggleButton>
            <ToggleButton value="name" aria-label="按名称排序">
              按名称
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            共 {sortedItems.length} 种物品
          </Typography>
        </Box>
      </Paper>

      {/* 物品卡片网格 */}
      <Grid container spacing={3}>
        {sortedItems.map((item) => (
          <Grid
            key={item.itemId}
            size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
          >
            {/* 物品卡片 */}
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {/* 物品图片 */}
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  image={item.imageUrl}
                  alt={item.itemName}
                  sx={{
                    height: 160,
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5',
                    p: 2,
                  }}
                />
              )}
              {/* 如果没有图片，显示占位符 */}
              {!item.imageUrl && (
                <Box
                  sx={{
                    height: 160,
                    bgcolor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    暂无图片
                  </Typography>
                </Box>
              )}
              
              {/* 物品信息 */}
              <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                {/* 物品名称 */}
                <Typography
                  variant="subtitle1"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '3em',
                  }}
                >
                  {item.itemName}
                </Typography>

                {/* 所需数量 */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: 'primary.light',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="primary.contrastText" sx={{ mb: 0.5 }}>
                    所需数量
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.contrastText',
                    }}
                  >
                    {item.totalCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 空状态提示 */}
      {sortedItems.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6">
            暂无任务物品数据
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            请检查任务数据是否已加载
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default QuestItems;
