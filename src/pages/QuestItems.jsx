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
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';

// 导入任务数据
import { getAllTasks } from '../data/TaskData';
// 导入物品数据
import itemsData from '../data/items.json';

/**
 * 从所有任务中提取需要提交的物品
 * @returns {Array} 物品数组，每个元素包含 itemId, itemName, totalCount, imageUrl, tasks
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
        // 从objective中获取物品信息
        const itemId = objective.item.id;
        const itemName = objective.item.name;
        const count = objective.count || 1;

        if (itemsMap.has(itemId)) {
          // 如果物品已存在，检查是否已有该任务，避免重复计数
          const existingItem = itemsMap.get(itemId);
          // 查找是否已经存在相同的任务
          const existingTaskIndex = existingItem.tasks.findIndex(
            (t) => t.taskName === task.taskName && t.trader === task.trader.name
          );
          
          if (existingTaskIndex >= 0) {
            // 任务已存在，累加数量到现有任务
            existingItem.tasks[existingTaskIndex].count += count;
            existingItem.totalCount += count;
          } else {
            // 新任务，添加到列表
            existingItem.totalCount += count;
            existingItem.tasks.push({
              taskName: task.taskName,
              trader: task.trader.name,
              count: count,
            });
          }
        } else {
          // 新物品，添加到Map
          itemsMap.set(itemId, {
            itemId,
            itemName,
            totalCount: count,
            imageUrl: itemImageMap.get(itemId) || '',
            tasks: [{
              taskName: task.taskName,
              trader: task.trader.name,
              count: count,
            }],
          });
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
  // 选中的商人过滤器，null 表示显示所有
  const [selectedTrader, setSelectedTrader] = useState(null);

  // 提取并处理物品数据，过滤掉卢布
  const questItems = useMemo(() => {
    const allItems = extractQuestItems();
    // 过滤掉卢布
    return allItems.filter((item) => item.itemName !== '卢布');
  }, []);

  // 提取所有商人列表
  const traders = useMemo(() => {
    const traderSet = new Set();
    questItems.forEach((item) => {
      item.tasks.forEach((task) => {
        traderSet.add(task.trader);
      });
    });
    return Array.from(traderSet).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [questItems]);

  // 根据商人过滤物品，并计算该商人的所需数量
  const filteredItems = useMemo(() => {
    if (!selectedTrader) {
      return questItems;
    }
    // 只显示包含选定商人任务的物品，并重新计算数量
    return questItems
      .filter((item) =>
        item.tasks.some((task) => task.trader === selectedTrader)
      )
      .map((item) => {
        // 过滤出当前商人的任务
        const traderTasks = item.tasks.filter(
          (task) => task.trader === selectedTrader
        );
        // 计算该商人需要的总数量
        const traderCount = traderTasks.reduce((sum, task) => sum + task.count, 0);
        return {
          ...item,
          totalCount: traderCount,
          tasks: traderTasks, // 只显示该商人的任务
        };
      });
  }, [questItems, selectedTrader]);

  // 根据排序方式排序物品
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (sortBy === 'count') {
      // 按数量降序排序
      items.sort((a, b) => b.totalCount - a.totalCount);
    } else if (sortBy === 'name') {
      // 按名称排序
      items.sort((a, b) => a.itemName.localeCompare(b.itemName, 'zh-CN'));
    }
    return items;
  }, [filteredItems, sortBy]);

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

  /**
   * 处理商人过滤改变
   * @param {string|null} trader - 商人名称，null表示显示所有
   */
  const handleTraderChange = (trader) => {
    setSelectedTrader(trader);
  };

  return (
    <Container maxWidth="xl">
      {/* 页面标题区域 */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          任务物品收集统计
        </Typography>
        <Typography variant="body1" color="text.secondary">
          显示所有任务中需要提交的物品及其数量，悬停查看详细任务信息
        </Typography>
      </Box>

      {/* 商人过滤区域 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <FilterListIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              按商人筛选：
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="全部"
              onClick={() => handleTraderChange(null)}
              color={selectedTrader === null ? 'primary' : 'default'}
              variant={selectedTrader === null ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            {traders.map((trader) => (
              <Chip
                key={trader}
                label={trader}
                onClick={() => handleTraderChange(trader)}
                color={selectedTrader === trader ? 'primary' : 'default'}
                variant={selectedTrader === trader ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* 控制栏 - 排序选项 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
            {selectedTrader ? `${selectedTrader}: ` : ''}共 {sortedItems.length} 种物品
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
            {/* 物品卡片 - 添加Tooltip显示任务详情 */}
            <Tooltip
              title={
                <Box sx={{ maxWidth: 400 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    需要该物品的任务：
                  </Typography>
                  {item.tasks.map((task, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        • {task.taskName}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 2, color: 'rgba(255,255,255,0.8)' }}>
                        {task.trader} - 需要 {task.count} 个
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
              arrow
              placement="top"
              enterDelay={300}
              leaveDelay={200}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'help',
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
            </Tooltip>
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
