import { useState } from 'react';
import Typography from '@mui/material/Typography';

import BasicItem from '../utils/BasicItem';
import { isFavorited, toggleFavorite } from '../utils/favorites';
import { UnifiedItemCard } from './common/UnifiedItemCard';

// 定义 Props 的接口结构
interface BasicItemCardProps {
    x: BasicItem;
    onFavoriteChange?: (itemId: string, isFavorited: boolean) => void;
}

export default function BasicItemCard({ x, onFavoriteChange }: BasicItemCardProps) {
    const [favorited, setFavorited] = useState<boolean>(() => isFavorited(x.itemId));

    function backgroundColor(slotPrice:number):string {
        if (slotPrice >= 500000) {
            return 'rgba(255, 217, 0, 1)'
        }

        return '#f0f0f0'
    }

    const handleFavoriteClick = (e: React.MouseEvent) => {
        const newStatus = toggleFavorite(x.itemId);
        setFavorited(newStatus);
        if (onFavoriteChange) {
            onFavoriteChange(x.itemId, newStatus);
        }
    };

    let cardColor:string = backgroundColor(x.averageSlotPriceMarket);

    return (
        <UnifiedItemCard
            title={x.itemName}
            imageUrl={x.imageLink}
            imageHeight={180}
            isFavorited={favorited}
            onFavoriteToggle={handleFavoriteClick}
            sx={{
                bgcolor: cardColor,
                maxWidth: 345, // Keep original maxWidth constraint
            }}
        >
            <Typography variant="body2" color="text.secondary">
                市场价格: {x.priceMarket} ₽ 基础价格 {x.priceBase} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
                重量: {x.weight} kg 体积: {x.height} x {x.width}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                单格价值: {x.averageSlotPriceMarket}
            </Typography>
        </UnifiedItemCard>
    )
}
