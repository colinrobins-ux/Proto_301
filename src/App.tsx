import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowDropDown,
  ArrowDropUp,
  CalendarMonth,
  ExpandLess,
  ExpandMore,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import monthlyData from './data/content_metrics.json';
import { MonthlyEntry, WeeklyPoint } from './types';

const metricDefinitions = [
  {
    key: 'content_views',
    label: 'Content Views',
    valueLabel: (value: number) => value.toLocaleString(),
    isPercent: false,
    invertTrend: false,
  },
  {
    key: 'subscriber_churn',
    label: 'Subscriber Churn Rate',
    valueLabel: (value: number) => `${value.toFixed(1)}%`,
    isPercent: true,
    invertTrend: true,
  },
  {
    key: 'ad_revenue',
    label: 'Ad Revenue',
    valueLabel: (value: number) => `$${Math.round(value / 1000)}k`,
    isPercent: false,
    invertTrend: false,
  },
  {
    key: 'engagement_rate',
    label: 'Engagement Rate',
    valueLabel: (value: number) => `${value.toFixed(1)}%`,
    isPercent: true,
    invertTrend: false,
  },
  {
    key: 'content_publish_volume',
    label: 'Publish Volume',
    valueLabel: (value: number) => value.toLocaleString(),
    isPercent: false,
    invertTrend: false,
  },
  {
    key: 'avg_time_on_page',
    label: 'Avg. Time on Page',
    valueLabel: (value: number) => `${value.toFixed(0)}s`,
    isPercent: false,
    invertTrend: false,
  },
  {
    key: 'new_subscriber_signups',
    label: 'New Subscriber Signups',
    valueLabel: (value: number) => value.toLocaleString(),
    isPercent: false,
    invertTrend: false,
  },
];

const filterOptions = [
  'This Week',
  'This Month',
  'Last 30 Days',
  'Month Picker',
  'Year to Date',
] as const;

type FilterOption = (typeof filterOptions)[number];

type ChartPoint = {
  label: string;
  content_views: number;
  subscriber_churn?: number;
  ad_revenue: number;
  engagement_rate: number;
  content_publish_volume?: number;
  avg_time_on_page?: number;
  month?: string;
  year?: number;
  revenue_breakdown?: {
    display: number;
    pre_roll: number;
    sponsored: number;
  };
};

const monthLabel = (entry: MonthlyEntry) => `${entry.month} ${entry.year}`;

const formatDelta = (current: number, prior: number) => {
  if (prior === 0) {
    return { percent: 0, direction: 'up' as const };
  }
  const diff = current - prior;
  const percent = (diff / Math.max(Math.abs(prior), 1)) * 100;
  return { percent, direction: diff >= 0 ? 'up' : 'down' as const };
};

const getLast = <T,>(items: T[], offset = 1): T | undefined => {
  if (items.length === 0) return undefined;
  return items[items.length - offset];
};

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeFilter, setTimeFilter] = useState<FilterOption>('This Month');
  const [view, setView] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(monthLabel(monthlyData[monthlyData.length - 1]));
  const [churnThreshold, setChurnThreshold] = useState(3.0);
  const [pinnedPoint, setPinnedPoint] = useState<string>('');
  const [highlightedMetric, setHighlightedMetric] = useState<string>('');

  const barRef = useRef<HTMLDivElement | null>(null);
  const churnRef = useRef<HTMLDivElement | null>(null);
  const revenueRef = useRef<HTMLDivElement | null>(null);
  const engagementRef = useRef<HTMLDivElement | null>(null);
  const scatterRef = useRef<HTMLDivElement | null>(null);

  const selectedMonthEntry = useMemo(
    () => monthlyData.find((entry) => monthLabel(entry) === selectedMonth) ?? monthlyData[monthlyData.length - 1],
    [selectedMonth],
  );

  const allWeekly = useMemo(
    () =>
      monthlyData.flatMap((month) =>
        month.week.map((week) => ({
          ...week,
          month: month.month,
          year: month.year,
          label: `${week.weekLabel}`,
          revenue_breakdown: month.revenue_breakdown,
        })),
      ),
    [],
  );

  const lastWeeklyPoints = useMemo(() => allWeekly.slice(-5), [allWeekly]);

  const yearSeries = useMemo(
    () => monthlyData.filter((entry) => entry.year === selectedMonthEntry.year),
    [selectedMonthEntry.year],
  );

  const monthlyWindow = useMemo(() => {
    const index = monthlyData.indexOf(selectedMonthEntry);
    return monthlyData.slice(Math.max(0, index - 11), index + 1);
  }, [selectedMonthEntry]);

  const weeklyForMonth = selectedMonthEntry.week.map((week) => ({
    ...week,
    label: week.weekLabel,
    month: selectedMonthEntry.month,
    year: selectedMonthEntry.year,
    content_publish_volume: selectedMonthEntry.content_publish_volume,
    avg_time_on_page: selectedMonthEntry.avg_time_on_page,
    revenue_breakdown: selectedMonthEntry.revenue_breakdown,
  }));

  const weeklySeries = useMemo<ChartPoint[]>(() => {
    if (timeFilter === 'This Week') {
      return allWeekly.slice(-4).map((week) => ({ ...week }));
    }
    if (timeFilter === 'Last 30 Days') {
      return allWeekly.slice(-5).map((week) => ({ ...week }));
    }
    if (timeFilter === 'Year to Date') {
      return allWeekly.filter((week) => week.year === selectedMonthEntry.year).slice(-12).map((week) => ({ ...week }));
    }
    return weeklyForMonth;
  }, [timeFilter, allWeekly, selectedMonthEntry.year, weeklyForMonth]);

  const monthlySeries = useMemo<ChartPoint[]>(() => {
    if (timeFilter === 'Year to Date') {
      return yearSeries.map((entry) => ({
        label: monthLabel(entry),
        content_views: entry.content_views,
        subscriber_churn: entry.subscriber_churn,
        ad_revenue: entry.ad_revenue,
        engagement_rate: entry.engagement_rate,
        content_publish_volume: entry.content_publish_volume,
        avg_time_on_page: entry.avg_time_on_page,
        revenue_breakdown: entry.revenue_breakdown,
      }));
    }
    return monthlyWindow.map((entry) => ({
      label: monthLabel(entry),
      content_views: entry.content_views,
      subscriber_churn: entry.subscriber_churn,
      ad_revenue: entry.ad_revenue,
      engagement_rate: entry.engagement_rate,
      content_publish_volume: entry.content_publish_volume,
      avg_time_on_page: entry.avg_time_on_page,
      revenue_breakdown: entry.revenue_breakdown,
    }));
  }, [timeFilter, yearSeries, monthlyWindow]);

  const displayedSeries = view === 'weekly' || timeFilter === 'This Week' || timeFilter === 'Last 30 Days' ? weeklySeries : monthlySeries;

  const currentPeriod = displayedSeries[displayedSeries.length - 1];
  const priorPeriod = displayedSeries[displayedSeries.length - 2] ?? displayedSeries[displayedSeries.length - 1];

  const getMetricValue = (metricKey: string, point: ChartPoint) => {
    if (!point) return 0;
    return Number(point[metricKey as keyof ChartPoint] ?? 0);
  };

  const getYtdValues = (metricKey: string) => {
    const values = yearSeries.map((entry) => Number(entry[metricKey as keyof MonthlyEntry] ?? 0));
    if (metricKey === 'subscriber_churn' || metricKey === 'engagement_rate' || metricKey === 'avg_time_on_page') {
      return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    }
    return values.reduce((sum, value) => sum + value, 0);
  };

  const highlightedChart = (key: string) => {
    setHighlightedMetric(key);
    const map = {
      content_views: barRef,
      subscriber_churn: churnRef,
      ad_revenue: revenueRef,
      engagement_rate: engagementRef,
      avg_time_on_page: scatterRef,
      content_publish_volume: engagementRef,
      new_subscriber_signups: scatterRef,
    } as Record<string, React.RefObject<HTMLDivElement | null>>;
    const ref = map[key];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const metricCards = metricDefinitions.map((metric) => {
    const rawCurrent = timeFilter === 'Year to Date' ? getYtdValues(metric.key) : getMetricValue(metric.key, currentPeriod ?? {} as ChartPoint);
    const rawPrior = timeFilter === 'Year to Date' ? getYtdValues(metric.key) * 0.95 : getMetricValue(metric.key, priorPeriod ?? {} as ChartPoint);
    const { percent, direction } = formatDelta(rawCurrent, rawPrior);
    const isPositive = metric.invertTrend ? direction === 'down' : direction === 'up';
    const formattedValue = metric.valueLabel(rawCurrent);
    const formattedDelta = `${Math.abs(percent).toFixed(1)}%`;
    const sparklineData = displayedSeries.slice(-8);
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={metric.key}>
        <Card
          className={`metric-card ${highlightedMetric === metric.key ? 'metric-highlight' : ''}`}
          sx={{ cursor: 'pointer', minHeight: 220 }}
          onClick={() => highlightedChart(metric.key)}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.label}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {isPositive ? <ArrowDropUp sx={{ color: '#3DD68C' }} /> : <ArrowDropDown sx={{ color: '#F87171' }} />}
                <Typography variant="caption" sx={{ color: isPositive ? '#3DD68C' : '#F87171' }}>
                  {formattedDelta}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontFamily: 'Roboto Mono, monospace', letterSpacing: '0.04em', mb: 2 }}>
              {formattedValue}
            </Typography>
            <Box sx={{ width: '100%', height: 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey={metric.key} stroke="#A78BFA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {view === 'weekly' || timeFilter === 'This Week' || timeFilter === 'Last 30 Days'
                ? 'Trend (weekly)'
                : timeFilter === 'Year to Date'
                ? 'YTD trend'
                : 'Trend (monthly)'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  });

  const onBarClick = (data: any) => {
    if (!data || !data.activeLabel) return;
    const clicked = monthlyData.find((entry) => monthLabel(entry) === data.activeLabel);
    if (clicked) {
      setView('weekly');
      setSelectedMonth(monthLabel(clicked));
      setTimeFilter('Month Picker');
    }
  };

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setChurnThreshold(clampValue(value, 1.5, 8));
  };

  const scatterData = useMemo(() => {
    return displayedSeries.map((point) => ({
      label: point.label,
      x: point.engagement_rate,
      y: point.avg_time_on_page ?? 0,
      z: point.content_views / 2000,
      color: point.engagement_rate && point.engagement_rate >= 7 ? '#5B8DEF' : '#A78BFA',
      value: point,
    }));
  }, [displayedSeries]);

  const currentSeriesLabel =
    timeFilter === 'This Week'
      ? 'Recent weeks'
      : timeFilter === 'Last 30 Days'
      ? 'Last 30 days'
      : timeFilter === 'Year to Date'
      ? `${selectedMonthEntry.year} YTD`
      : view === 'weekly'
      ? `${selectedMonthEntry.month} ${selectedMonthEntry.year}`
      : 'Rolling monthly trend';

  return (
    <Box sx={{ minHeight: '100vh', background: '#0E0F14', pb: 8 }}>
      <AppBar position="sticky" className="mui-appbar" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '0.08em' }}>
              Content Command Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Content Strategy Manager
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="time-filter-label">Time Range</InputLabel>
            <Select
              labelId="time-filter-label"
              value={timeFilter}
              label="Time Range"
              onChange={(event: SelectChangeEvent) => setTimeFilter(event.target.value as FilterOption)}
              sx={{ color: '#F0F2F8' }}
            >
              {filterOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, next) => next && setView(next)}
            size="small"
            sx={{ background: '#16181F', borderRadius: 2, border: '1px solid rgba(91, 141, 239, 0.18)' }}
          >
            <ToggleButton value="weekly" sx={{ color: '#F0F2F8' }}>
              Weekly View
            </ToggleButton>
            <ToggleButton value="monthly" sx={{ color: '#F0F2F8' }}>
              Monthly View
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
        <Box className="solid-horizon" />
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: 5 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {currentSeriesLabel}
        </Typography>

        <Grid container spacing={3} className="dashboard-row">
          <Grid item xs={12}>
            <Box
              sx={{
                display: isMobile ? 'flex' : 'grid',
                gridTemplateColumns: isMobile ? 'none' : 'repeat(4, minmax(0, 1fr))',
                gap: 16,
                overflowX: isMobile ? 'auto' : 'visible',
                pb: isMobile ? 1 : 0,
              }}
            >
              {metricCards}
            </Box>
          </Grid>

          <Grid item xs={12} md={6} ref={barRef}>
            <Card className={`chart-card ${highlightedMetric === 'content_views' ? 'metric-highlight' : ''}`}>
              <Box className="chart-header">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Content Views
                  </Typography>
                  <Typography variant="h6">Views by {view === 'weekly' ? 'week' : 'month'}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Click a bar to drill into that month
                </Typography>
              </Box>
              <Box sx={{ height: 320, px: 2, pb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedSeries} onClick={onBarClick} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
                    <Bar dataKey="content_views" radius={[8, 8, 0, 0]}> 
                      {displayedSeries.map((entry, index) => {
                        const avg = displayedSeries.reduce((sum, item) => sum + item.content_views, 0) / displayedSeries.length;
                        return (
                          <Cell key={`cell-${index}`} fill={entry.content_views >= avg ? '#5B8DEF' : '#1E2029'} />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} ref={churnRef}>
            <Card className={`chart-card ${highlightedMetric === 'subscriber_churn' ? 'metric-highlight' : ''}`}>
              <Box className="chart-header">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subscriber Churn Rate
                  </Typography>
                  <Typography variant="h6">Churn trend</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    value={churnThreshold}
                    onChange={handleThresholdChange}
                    size="small"
                    inputProps={{ inputMode: 'decimal', pattern: '[0-9]*\.?[0-9]+' }}
                    sx={{ width: 92, '& .MuiInputBase-input': { color: '#F0F2F8' } }}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Target threshold
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, px: 2, pb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayedSeries} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
                    <ReferenceLine y={churnThreshold} stroke="#3DD68C" strokeDasharray="5 5" label={{ value: `Target ${churnThreshold}%`, position: 'insideTopRight', fill: '#3DD68C' }} />
                    <Line type="monotone" dataKey="subscriber_churn" stroke="#F87171" strokeWidth={3} dot={{ r: 4, fill: '#F87171' }} />
                    <Area type="monotone" dataKey="subscriber_churn" stroke="none" fillOpacity={0.18} fill="#F87171" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} ref={revenueRef}>
            <Card className={`chart-card ${highlightedMetric === 'ad_revenue' ? 'metric-highlight' : ''}`}>
              <Box className="chart-header">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ad Revenue Composition
                  </Typography>
                  <Typography variant="h6">Revenue by type</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, px: 2, pb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayedSeries} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
                    <Area dataKey="revenue_breakdown.display" stackId="1" stroke="#5B8DEF" fill="#5B8DEF" />
                    <Area dataKey="revenue_breakdown.pre_roll" stackId="1" stroke="#A78BFA" fill="#A78BFA" />
                    <Area dataKey="revenue_breakdown.sponsored" stackId="1" stroke="#3DD68C" fill="#3DD68C" />
                    <Legend wrapperStyle={{ color: '#F0F2F8' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} ref={engagementRef}>
            <Card className={`chart-card ${highlightedMetric === 'engagement_rate' ? 'metric-highlight' : ''}`}>
              <Box className="chart-header">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Engagement vs Publish Volume
                  </Typography>
                  <Typography variant="h6">Audience response</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 320, px: 2, pb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={displayedSeries} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }} />
                    <Line yAxisId="left" type="monotone" dataKey="engagement_rate" stroke="#5B8DEF" strokeWidth={3} dot={{ r: 4, fill: '#5B8DEF' }} />
                    <Line yAxisId="right" type="monotone" dataKey="content_publish_volume" stroke="#A78BFA" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} ref={scatterRef}>
            <Card className={`chart-card ${highlightedMetric === 'avg_time_on_page' ? 'metric-highlight' : ''}`}> 
              <Box className="chart-header">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Content Quality Signal
                  </Typography>
                  <Typography variant="h6">Time on page vs engagement</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Click a dot to pin details
                </Typography>
              </Box>
              <Box sx={{ height: 420, px: 2, pb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" dataKey="x" name="Engagement" unit="%" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <YAxis type="number" dataKey="y" name="Avg time" unit="s" tick={{ fill: '#8B90A7' }} axisLine={false} tickLine={false} />
                    <ZAxis dataKey="z" range={[100, 400]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ background: '#11151F', borderColor: '#2A2D3A' }}
                      formatter={(value: number, name: string) => [value, name]}
                      labelFormatter={(label) => `Point`}
                    />
                    <Scatter
                      data={scatterData}
                      fill="#5B8DEF"
                      onClick={(event) => {
                        if (event && 'payload' in event && event.payload) {
                          setPinnedPoint(event.payload.label);
                        }
                      }}
                    >
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
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarMonth sx={{ color: '#A78BFA' }} />
          <Typography variant="caption" color="text.secondary">
            {timeFilter === 'Month Picker' ? `Focused on ${selectedMonthEntry.month} ${selectedMonthEntry.year}` : 'Interactive dashboard aligned to your selected range.'}
          </Typography>
          {timeFilter === 'Month Picker' ? (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="month-picker-label">Month</InputLabel>
              <Select
                labelId="month-picker-label"
                value={selectedMonth}
                label="Month"
                onChange={(event: SelectChangeEvent) => setSelectedMonth(event.target.value)}
                sx={{ color: '#F0F2F8' }}
              >
                {monthlyData.map((month) => (
                  <MenuItem key={monthLabel(month)} value={monthLabel(month)}>
                    {monthLabel(month)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
};

export default App;
