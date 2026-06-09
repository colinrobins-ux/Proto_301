import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from './ChartCard';
import { chartTickStyle } from './chartStyles';
import { ChartPoint } from '../types';

type ContentViewsChartProps = {
  displayedSeries: ChartPoint[];
  highlighted: boolean;
  subtitle: string;
  onBarClick: (data: any) => void;
};

const ContentViewsChart = ({ displayedSeries, highlighted, subtitle, onBarClick }: ContentViewsChartProps) => {
  const average = displayedSeries.reduce((sum, point) => sum + point.content_views, 0) / Math.max(displayedSeries.length, 1);

  return (
    <ChartCard
      title="Content Views"
      subtitle={subtitle}
      rightNode={<Typography variant="caption" color="text.secondary">Click to drill</Typography>}
      highlighted={highlighted}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayedSeries} onClick={onBarClick} margin={{ left: 0, right: 10, top: 6, bottom: 6 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" tick={chartTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
          <Bar dataKey="content_views" radius={[8, 8, 0, 0]}>
            {displayedSeries.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.content_views >= average ? '#5B8DEF' : '#1E2029'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ContentViewsChart;
