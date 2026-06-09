import { Box, Card } from '@mui/material';
import { forwardRef, ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  subtitle: string;
  rightNode?: ReactNode;
  highlighted?: boolean;
  children: ReactNode;
};

const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(
  ({ title, subtitle, rightNode, highlighted, children }, ref) => (
    <Card
      ref={ref}
      className={`chart-card ${highlighted ? 'metric-highlight' : ''}`}
      sx={{ height: '100%', minHeight: 360, p: 1.5, display: 'flex', flexDirection: 'column' }}
    >
      <Box className="chart-header">
        <Box>
          <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
              {title}
            </Box>
            <Box component="span" sx={{ typography: 'subtitle1' }}>
              {subtitle}
            </Box>
          </Box>
        </Box>
        {rightNode ? <Box>{rightNode}</Box> : null}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, width: '100%', px: 1.5, pb: 1 }}>{children}</Box>
    </Card>
  ),
);

ChartCard.displayName = 'ChartCard';

export default ChartCard;
