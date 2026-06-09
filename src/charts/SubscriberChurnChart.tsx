import { Box, TextField, Typography } from '@mui/material';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from './ChartCard';
import { chartTickStyle } from './chartStyles';
import { ChartPoint } from '../types';

type SubscriberChurnChartProps = {
  displayedSeries: ChartPoint[];
  churnThreshold: number;
  highlighted: boolean;
  onThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  subtitle: string;
};

const SubscriberChurnChart = ({
  displayedSeries,
  churnThreshold,
  highlighted,
  onThresholdChange,
  subtitle,
}: SubscriberChurnChartProps) => (
  <ChartCard
    title="Subscriber Churn Rate"
    subtitle={subtitle}
    highlighted={highlighted}
    rightNode={
      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          value={churnThreshold}
          onChange={onThresholdChange}
          size="small"
          inputProps={{ inputMode: 'decimal', pattern: '[0-9]*\.?[0-9]+' }}
          sx={{ width: 72, '& .MuiInputBase-input': { color: '#F0F2F8' } }}
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary">
          Target
        </Typography>
      </Box>
    }
  >
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={displayedSeries} margin={{ left: 0, right: 10, top: 6, bottom: 6 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="label" tick={chartTickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} unit="%" />
        <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
        <ReferenceLine
          y={churnThreshold}
          stroke="#3DD68C"
          strokeDasharray="5 5"
          label={{ value: `Target ${churnThreshold}%`, position: 'insideTopRight', fill: '#3DD68C', fontSize: 12 }}
        />
        <Line type="monotone" dataKey="subscriber_churn" stroke="#F87171" strokeWidth={3} dot={{ r: 4, fill: '#F87171' }} />
        <Area type="monotone" dataKey="subscriber_churn" stroke="none" fillOpacity={0.18} fill="#F87171" />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default SubscriberChurnChart;
