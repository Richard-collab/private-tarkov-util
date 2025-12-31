import { Box, CardContent, CardMedia, IconButton, Typography, SxProps, Theme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { AppCard } from './AppCard';
import { ReactNode } from 'react';

export interface UnifiedItemCardProps {
  title: string;
  imageUrl?: string;
  imageHeight?: number;
  isFavorited?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  children?: ReactNode;
  headerRight?: ReactNode; // Slot for anything extra in the header area
}

export function UnifiedItemCard({
  title,
  imageUrl,
  imageHeight = 160,
  isFavorited,
  onFavoriteToggle,
  onClick,
  sx,
  children,
}: UnifiedItemCardProps) {

  return (
    <AppCard
      hoverable={!!onClick || !!onFavoriteToggle} // Assume hoverable if interactive
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      onClick={onClick}
    >
      {/* Image Area */}
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={title}
          sx={{
            height: imageHeight,
            width: '100%',
            objectFit: 'contain',
            bgcolor: '#f5f5f5', // Standard gray background for items
            p: 1, // Padding to ensure image isn't edge-to-edge if it's irregular
          }}
        />
      ) : (
        <Box
          sx={{
            height: imageHeight,
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

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          component="div"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3em', // Ensure consistent height for titles
            lineHeight: 1.5,
          }}
        >
          {title}
        </Typography>

        {/* Dynamic Content */}
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </CardContent>

      {/* Favorite Button Overlay - Positioned Bottom Right */}
      {onFavoriteToggle && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 1, // Ensure it's above other content
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(e);
            }}
            sx={{
              color: isFavorited ? 'warning.main' : 'action.disabled',
              bgcolor: isFavorited ? 'rgba(255, 193, 7, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: isFavorited ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 0, 0, 0.08)',
              },
            }}
            aria-label={isFavorited ? '取消收藏' : '添加收藏'}
          >
            {isFavorited ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Box>
      )}
    </AppCard>
  );
}
