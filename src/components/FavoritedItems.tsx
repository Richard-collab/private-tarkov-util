/**
 * 收藏物品组件
 * 
 * 该组件展示用户收藏的所有物品，包含：
 * - 标题显示 "你丫收藏的物品"
 * - 从 localStorage 读取收藏物品ID
 * - 使用 BasicItemCard 组件展示每个物品
 * - 支持分页，每页显示20个物品
 * 
 * 收藏数据存储在 localStorage 中，不需要后端支持
 */

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Pagination, Paper } from '@mui/material';
import BasicItemCard from './BasicItemCard';
import BasicItem from '../utils/BasicItem';
import { getFavoriteIds } from '../utils/favorites';

// 导入物品数据
import itemsData from '../data/items.json';

// 每页显示的物品数量
const ITEMS_PER_PAGE = 20;

/**
 * 收藏物品组件
 * @returns {JSX.Element} 收藏物品列表
 */
export default function FavoritedItems() {
    // 收藏的物品列表状态
    const [favoritedItems, setFavoritedItems] = useState<BasicItem[]>([]);
    // 当前页码
    const [page, setPage] = useState(1);

    /**
     * 加载收藏物品数据
     */
    const loadFavoritedItems = useCallback(() => {
        const favoriteIds = getFavoriteIds();
        
        // 从物品数据中筛选收藏的物品
        const items: BasicItem[] = [];
        favoriteIds.forEach((id) => {
            const itemData = itemsData.items.find((item) => item.id === id);
            if (itemData) {
                const basicItem = new BasicItem(
                    itemData.id,
                    itemData.name,
                    itemData.image8xLink,
                    itemData.avg24hPrice,
                    itemData.basePrice,
                    itemData.height,
                    itemData.width,
                    itemData.weight
                );
                items.push(basicItem);
            }
        });
        
        setFavoritedItems(items);
    }, []);

    // 组件挂载时加载收藏物品
    useEffect(() => {
        loadFavoritedItems();
    }, [loadFavoritedItems]);

    /**
     * 处理收藏状态变化
     * 当物品收藏状态改变时重新加载列表
     */
    const handleFavoriteChange = useCallback(() => {
        loadFavoritedItems();
        // 如果当前页没有物品了，回到第一页
        const totalPages = Math.ceil((favoritedItems.length - 1) / ITEMS_PER_PAGE);
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        } else if (totalPages === 0) {
            setPage(1);
        }
    }, [loadFavoritedItems, favoritedItems.length, page]);

    /**
     * 处理页码变化
     */
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // 计算当前页显示的物品
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = favoritedItems.slice(startIndex, endIndex);
    const totalPages = Math.ceil(favoritedItems.length / ITEMS_PER_PAGE);

    // 如果没有收藏物品，不显示组件
    if (favoritedItems.length === 0) {
        return null;
    }

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
            {/* 标题区域 */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                    }}
                >
                    你丫收藏的物品
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    共 {favoritedItems.length} 件收藏
                </Typography>
            </Box>

            {/* 物品卡片网格 */}
            <Grid container spacing={3}>
                {currentItems.map((item) => (
                    <Grid
                        key={item.itemId}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}
                    >
                        <BasicItemCard x={item} onFavoriteChange={handleFavoriteChange} />
                    </Grid>
                ))}
            </Grid>

            {/* 分页控件 */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Paper>
    );
}
