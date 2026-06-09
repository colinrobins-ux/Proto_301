import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from './ChartCard';
import { chartTickStyle } from './chartStyles';
import { ChartPoint } from '../types';

type EngagementChartProps = {
  displayedSeries: ChartPoint[];
  highlighted: boolean;
  subtitle: string;
};

const EngagementChart = ({ displayedSeries, highlighted, subtitle }: EngagementChartProps) => (
  <ChartCard title="Engagement vs Publish Volume" subtitle={subtitle} highlighted={highlighted}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={displayedSeries} margin={{ left: 0, right: 10, top: 6, bottom: 6 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="label" tick={chartTickStyle} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={chartTickStyle} axisLine={false} tickLine={false} unit="%" />
        <YAxis yAxisId="right" orientation="right" tick={chartTickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
        <Line yAxisId="left" type="monotone" dataKey="engagement_rate" stroke="#5B8DEF" strokeWidth={3} dot={{ r: 4, fill: '#5B8DEF' }} />
        <Line yAxisId="right" type="monotone" dataKey="content_publish_volume" stroke="#A78BFA" strokeWidth={2} dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default EngagementChart;
