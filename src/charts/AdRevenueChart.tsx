import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from './ChartCard';
import { chartLegendStyle, chartTickStyle } from './chartStyles';
import { ChartPoint } from '../types';

type AdRevenueChartProps = {
  displayedSeries: ChartPoint[];
  highlighted: boolean;
  subtitle: string;
};

const AdRevenueChart = ({ displayedSeries, highlighted, subtitle }: AdRevenueChartProps) => (
  <ChartCard title="Ad Revenue Composition" subtitle={subtitle} highlighted={highlighted}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={displayedSeries} margin={{ left: 0, right: 10, top: 6, bottom: 6 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="label" tick={chartTickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
        <Legend wrapperStyle={chartLegendStyle} />
        <Bar dataKey="revenue_breakdown.display" stackId="a" fill="#5B8DEF" radius={[6, 6, 0, 0]} />
        <Bar dataKey="revenue_breakdown.pre_roll" stackId="a" fill="#A78BFA" radius={[6, 6, 0, 0]} />
        <Bar dataKey="revenue_breakdown.sponsored" stackId="a" fill="#3DD68C" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default AdRevenueChart;
