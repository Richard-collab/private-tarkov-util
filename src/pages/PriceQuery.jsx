/**
 * 物价查询功能页面
 * 
 * 该组件提供物品价格查询功能，包含：
 * - 输入框：用于输入要查询的物品名称
 * - 查询按钮：点击后根据输入内容搜索物品
 * - 结果展示区：显示查询到的物品物价信息
 * 
 * 支持模糊搜索，使用 mock 数据（items.json）作为数据源
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Container,
  Divider,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// 导入物品数据（mock 数据）
import itemsData from '../data/items.json';
// 导入收藏功能工具
import { isFavorited, toggleFavorite } from '../utils/favorites';

/**
 * 物价查询页面组件
 * @returns {JSX.Element} 物价查询页面
 */
const PriceQuery = () => {
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');
  // 查询结果状态
  const [queryResults, setQueryResults] = useState([]);
  // 是否已执行过查询的标志
  const [hasSearched, setHasSearched] = useState(false);
  // 用于触发重新渲染的状态，当收藏状态改变时更新
  const [, setFavoriteToggle] = useState(false);

  /**
   * 处理收藏按钮点击
   * @param {string} itemId - 物品ID
   */
  const handleFavoriteClick = (itemId) => {
    toggleFavorite(itemId);
    // 触发重新渲染以反映最新的收藏状态
    setFavoriteToggle((prev) => !prev);
  };

  /**
   * 处理搜索操作
   * 根据输入的关键词在物品数据中进行模糊匹配
   */
  const handleSearch = () => {
    // 标记已执行查询
    setHasSearched(true);

    // 如果关键词为空，清空结果
    if (!searchKeyword.trim()) {
      setQueryResults([]);
      return;
    }

    // 在物品数据中进行模糊搜索
    const results = itemsData.items.filter((item) =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase().trim())
    );

    // 按照24小时平均价格降序排序（价格高的排前面）
    results.sort((a, b) => {
      const priceA = a.avg24hPrice || 0;
      const priceB = b.avg24hPrice || 0;
      return priceB - priceA;
    });

    // 限制返回结果数量为前20条
    setQueryResults(results.slice(0, 20));
  };

  /**
   * 处理键盘事件
   * 当用户按下回车键时触发搜索
   * @param {React.KeyboardEvent} event - 键盘事件对象
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 格式化价格显示
   * 将数字转换为带千分位分隔符的字符串
   * @param {number|null} price - 价格数值
   * @returns {string} 格式化后的价格字符串
   */
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return '暂无数据';
    }
    return price.toLocaleString('zh-CN');
  };

  /**
   * 计算单格价值
   * 根据物品价格和占用格子数计算每格的价值
   * @param {number|null} price - 物品价格
   * @param {number} height - 物品高度（格数）
   * @param {number} width - 物品宽度（格数）
   * @returns {string} 格式化后的单格价值
   */
  const calculateSlotValue = (price, height, width) => {
    if (price === null || price === undefined) {
      return '暂无数据';
    }
    const slots = height * width;
    const slotValue = Math.round(price / slots);
    return slotValue.toLocaleString('zh-CN');
  };

  return (
    <Container maxWidth="lg">
      {/* 页面标题区域 */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          物价查询
        </Typography>
        <Typography variant="body1" color="text.secondary">
          输入物品名称以查询当前市场物价信息
        </Typography>
      </Box>

      {/* 搜索区域 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* 搜索输入框 */}
          <TextField
            label="请输入物品名称"
            variant="outlined"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            size="medium"
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder="例如：AK-74、医疗包、钥匙..."
          />
          {/* 查询按钮 */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            size="large"
            sx={{ height: 56 }}
          >
            查询物价
          </Button>
        </Box>
      </Paper>

      {/* 结果展示区域 */}
      <Box>
        {/* 查询结果统计 */}
        {hasSearched && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {queryResults.length > 0
                ? `找到 ${queryResults.length} 个相关物品`
                : '未找到匹配的物品，请尝试其他关键词'}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        )}

        {/* 物品卡片网格 */}
        <Grid container spacing={3}>
          {queryResults.map((item) => (
            <Grid
              item
              key={item.id}
              xs={12}      // 超小屏幕：占满整行
              sm={6}       // 小屏幕：每行2个
              md={4}       // 中等屏幕：每行3个
              lg={3}       // 大屏幕：每行4个
            >
              {/* 物品卡片 */}
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* 物品图片 */}
                <CardMedia
                  component="img"
                  image={item.image8xLink}
                  alt={item.name}
                  sx={{
                    height: 160,
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5',
                    p: 1,
                  }}
                />
                {/* 物品信息 */}
                <CardContent sx={{ flexGrow: 1 }}>
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
                    {item.name}
                  </Typography>

                  {/* 价格信息 */}
                  <Box sx={{ mt: 1 }}>
                    {/* 市场价格 */}
                    <Typography variant="body2" color="text.secondary">
                      市场价格：
                      <Typography
                        component="span"
                        sx={{
                          color: item.avg24hPrice ? 'success.main' : 'text.disabled',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatPrice(item.avg24hPrice)} ₽
                      </Typography>
                    </Typography>

                    {/* 基础价格 */}
                    <Typography variant="body2" color="text.secondary">
                      基础价格：{formatPrice(item.basePrice)} ₽
                    </Typography>

                    {/* 物品尺寸 */}
                    <Typography variant="body2" color="text.secondary">
                      尺寸：{item.height} × {item.width}（{item.height * item.width}格）
                    </Typography>

                    {/* 单格价值 */}
                    <Typography variant="body2" color="text.secondary">
                      单格价值：
                      <Typography
                        component="span"
                        sx={{
                          color: item.avg24hPrice ? 'primary.main' : 'text.disabled',
                          fontWeight: 'medium',
                        }}
                      >
                        {calculateSlotValue(item.avg24hPrice, item.height, item.width)} ₽
                      </Typography>
                    </Typography>

                    {/* 物品重量 */}
                    <Typography variant="body2" color="text.secondary">
                      重量：{item.weight} kg
                    </Typography>
                  </Box>
                </CardContent>
                {/* 收藏按钮 - 固定在左下角，与 BasicItemCard 保持一致 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                  }}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick(item.id);
                    }}
                    sx={{
                      color: isFavorited(item.id) ? 'warning.main' : 'action.disabled',
                      bgcolor: isFavorited(item.id) ? 'rgba(255, 193, 7, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor: isFavorited(item.id) ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                    aria-label={isFavorited(item.id) ? '取消收藏' : '添加收藏'}
                  >
                    {isFavorited(item.id) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 空状态提示 */}
        {!hasSearched && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <SearchIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">
              请输入物品名称开始查询
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              支持中文和英文物品名称的模糊搜索
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PriceQuery;
