import { Card, CardProps, useTheme } from '@mui/material';
import { forwardRef } from 'react';

export interface AppCardProps extends CardProps {
  hoverable?: boolean;
  selected?: boolean;
}

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  ({ hoverable = false, selected = false, sx, children, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Card
        ref={ref}
        elevation={selected ? 4 : 1} // Higher elevation when selected
        sx={{
          position: 'relative', // Ensure absolute positioned children are relative to this
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
          border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent', // Highlight border for selected
          ...(hoverable && {
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }),
          ...sx,
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AppCard.displayName = 'AppCard';
