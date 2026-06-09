import { Box, Typography } from '@mui/material';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Cell } from 'recharts';
import ChartCard from './ChartCard';
import { chartTickStyle } from './chartStyles';
import { ChartPoint, ScatterPoint } from '../types';

type QualityScatterChartProps = {
  displayedSeries: ChartPoint[];
  highlighted: boolean;
  pinnedPoint: string;
  onPointClick: (label: string) => void;
};

const QualityScatterChart = ({ displayedSeries, highlighted, pinnedPoint, onPointClick }: QualityScatterChartProps) => {
  const scatterData: ScatterPoint[] = displayedSeries.map((point) => ({
    label: point.label,
    x: point.engagement_rate,
    y: point.avg_time_on_page ?? 0,
    z: point.content_views / 2000,
    color: point.engagement_rate && point.engagement_rate >= 7 ? '#5B8DEF' : '#A78BFA',
    value: point,
  }));

  return (
    <ChartCard
      title="Content Quality Signal"
      subtitle="Time on page vs engagement"
      highlighted={highlighted}
      rightNode={<Typography variant="caption" color="text.secondary">Click a dot to pin</Typography>}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ left: 0, right: 20, top: 6, bottom: 6 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" />
          <XAxis type="number" dataKey="x" name="Engagement" unit="%" tick={chartTickStyle} axisLine={false} tickLine={false} />
          <YAxis type="number" dataKey="y" name="Avg time" unit="s" tick={chartTickStyle} axisLine={false} tickLine={false} />
          <ZAxis dataKey="z" range={[100, 400]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }}
            formatter={(value: number, name: string) => [value, name]}
            labelFormatter={() => 'Point'}
          />
          <Scatter data={scatterData} fill="#5B8DEF" onClick={(event) => event && 'payload' in event && event.payload && onPointClick(event.payload.label)}>
            {scatterData.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {pinnedPoint ? (
        <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(91, 141, 239, 0.18)', borderRadius: 2, background: '#16181F' }}>
          <Typography variant="subtitle2" color="#5B8DEF">
            Pinned: {pinnedPoint}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Engagement, time, and volume comparison for the selected point.
          </Typography>
        </Box>
      ) : null}
    </ChartCard>
  );
};

export default QualityScatterChart;
