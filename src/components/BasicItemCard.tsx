// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// // import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';

import {Card, CardContent, CardMedia} from '@mui/material'
import Typography from '@mui/material/Typography';

import BasicItem from '../utils/BasicItem';

// 定义 Props 的接口结构
interface BasicItemCardProps {
    x:BasicItem;
}

export default function BasicItemCard({ x }: BasicItemCardProps) {

    function backgroundColor(slotPrice:number):string {
        if (slotPrice >= 500000) {
            return 'rgba(255, 217, 0, 1)'
        }

        return '#f0f0f0'
    }

    let cardColor:string = backgroundColor(x.averageSlotPriceMarket);

    return (
        <>
        <Card sx={{ maxWidth: 345, bgcolor: cardColor }}>
            <CardMedia
                component="img"
                image={x.imageLink} // 替换你的图片链接
                alt={x.itemName}
                sx={{
                height: 180,             // 1. 设定图片容器的高度
                width: '100%',           // 2. 宽度占满卡片
                objectFit: 'contain',    // 3. 关键：让图片在容器内完整显示，保持比例
                bgcolor: '#f0f0f0'    // (可选) 设置背景色，填充图片未覆盖的留白区域
                
                }}>
            </CardMedia>
            <CardContent>
                <Typography>
                    {x.itemName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    市场价格: {x.priceMarket} ₽ 基础价格 {x.priceBase} ₽
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    重量: {x.weight} kg 体积: {x.height} x {x.width}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    单格价值: {x.averageSlotPriceMarket}
                </Typography>
            </CardContent>
        </Card>
        </>
    )
}