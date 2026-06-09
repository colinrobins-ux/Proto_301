import { useMemo, useRef, useState } from 'react';
import { Box, Container, CssBaseline, createTheme, ThemeProvider, useMediaQuery, Typography } from '@mui/material';
import monthlyData from './data/content_metrics.json';
import { ChartPoint, FilterOption, MonthlyEntry, filterOptions } from './types';
import DashboardHeader from './components/DashboardHeader';
import SummarySnapshotCard, { SummaryMetricRow } from './components/SummarySnapshotCard';
import { ContentViewsChart, SubscriberChurnChart, AdRevenueChart, EngagementChart, QualityScatterChart } from './charts';

const appTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0E0F14',
      paper: '#16181F',
    },
    text: {
      primary: '#F0F2F8',
      secondary: '#AEB7D6',
    },
    divider: 'rgba(91, 141, 239, 0.18)',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0E0F14',
          color: '#F0F2F8',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#16181F',
          color: '#F0F2F8',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: '#F0F2F8',
        },
        notchedOutline: {
          borderColor: 'rgba(255,255,255,0.12)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#AEB7D6',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#F0F2F8',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#F0F2F8',
          '&:hover': {
            backgroundColor: 'rgba(91, 141, 239, 0.08)',
            color: '#F0F2F8',
          },
          '&.Mui-selected': {
            color: '#F0F2F8',
            backgroundColor: 'rgba(91, 141, 239, 0.12)',
          },
          '&.Mui-selected:hover': {
            color: '#F0F2F8',
            backgroundColor: 'rgba(91, 141, 239, 0.18)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#F0F2F8',
          '&.Mui-selected': {
            color: '#F0F2F8',
          },
          '&.Mui-selected:hover': {
            color: '#F0F2F8',
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        grouped: {
          borderColor: 'rgba(91,141,239,0.18)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#11151F',
          color: '#F0F2F8',
          border: '1px solid rgba(91,141,239,0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#F0F2F8',
        },
      },
    },
  },
});

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
  const isMobile = useMediaQuery('(max-width:600px)');
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
          subscriber_churn: month.subscriber_churn,
          content_publish_volume: month.content_publish_volume,
          avg_time_on_page: month.avg_time_on_page,
          revenue_breakdown: month.revenue_breakdown,
        })),
      ),
    [],
  );

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
    subscriber_churn: selectedMonthEntry.subscriber_churn,
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
    const source = timeFilter === 'Year to Date' ? yearSeries : monthlyWindow;
    return source.map((entry) => ({
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

  const getMetricValue = (metricKey: string, point: ChartPoint) => Number(point[metricKey as keyof ChartPoint] ?? 0);

  const getYtdValues = (metricKey: string) => {
    const values = yearSeries.map((entry) => Number(entry[metricKey as keyof MonthlyEntry] ?? 0));
    if (metricKey === 'subscriber_churn' || metricKey === 'engagement_rate' || metricKey === 'avg_time_on_page') {
      return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    }
    return values.reduce((sum, value) => sum + value, 0);
  };

  const highlightedChart = (key: string) => {
    setHighlightedMetric(key);
    const refMap = {
      content_views: barRef,
      subscriber_churn: churnRef,
      ad_revenue: revenueRef,
      engagement_rate: engagementRef,
      avg_time_on_page: scatterRef,
      content_publish_volume: engagementRef,
      new_subscriber_signups: scatterRef,
    } as const;

    const ref = refMap[key as keyof typeof refMap];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const frequencyLabel = view === 'weekly' || timeFilter === 'This Week' || timeFilter === 'Last 30 Days' ? 'Weekly' : 'Monthly';

  const metricSummaryRows: SummaryMetricRow[] = metricDefinitions.slice(0, 5).map((metric) => {
    const rawCurrent = timeFilter === 'Year to Date' ? getYtdValues(metric.key) : getMetricValue(metric.key, currentPeriod ?? ({} as ChartPoint));
    const rawPrior = timeFilter === 'Year to Date' ? getYtdValues(metric.key) * 0.95 : getMetricValue(metric.key, priorPeriod ?? ({} as ChartPoint));
    const { percent, direction } = formatDelta(rawCurrent, rawPrior);
    const isPositive = metric.invertTrend ? direction === 'down' : direction === 'up';
    const formattedValue = metric.valueLabel(rawCurrent);
    const formattedDelta = `${Math.abs(percent).toFixed(1)}%`;
    const sparklineData = displayedSeries.slice(-6);

    return {
      key: metric.key,
      label: metric.label,
      trend: {
        isPositive,
        formattedDelta,
      },
      value: formattedValue,
      freq: frequencyLabel,
      sparklineData,
    };
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
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#0E0F14', pb: 8 }}>
        <DashboardHeader
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          filterOptions={filterOptions}
          view={view}
          setView={setView}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          monthOptions={monthlyData.map(monthLabel)}
        />

        <Container maxWidth="xl" sx={{ pt: 5 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {currentSeriesLabel}
          </Typography>

          <Box component="section">
            <Box sx={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))' }}>
              <Box>
                <SummarySnapshotCard rows={metricSummaryRows} onMetricClick={highlightedChart} />
              </Box>
              <Box ref={barRef}>
                <ContentViewsChart
                  displayedSeries={displayedSeries}
                  highlighted={highlightedMetric === 'content_views'}
                  subtitle={`Views by ${view === 'weekly' ? 'week' : 'month'}`}
                  onBarClick={onBarClick}
                />
              </Box>
              <Box ref={churnRef}>
                <SubscriberChurnChart
                  displayedSeries={displayedSeries}
                  churnThreshold={churnThreshold}
                  highlighted={highlightedMetric === 'subscriber_churn'}
                  onThresholdChange={handleThresholdChange}
                  subtitle="Churn trend"
                />
              </Box>
              <Box ref={revenueRef}>
                <AdRevenueChart displayedSeries={displayedSeries} highlighted={highlightedMetric === 'ad_revenue'} subtitle="Revenue by type" />
              </Box>
              <Box ref={engagementRef}>
                <EngagementChart displayedSeries={displayedSeries} highlighted={highlightedMetric === 'engagement_rate'} subtitle="Audience response" />
              </Box>
              <Box ref={scatterRef}>
                <QualityScatterChart
                  displayedSeries={displayedSeries}
                  highlighted={highlightedMetric === 'avg_time_on_page'}
                  pinnedPoint={pinnedPoint}
                  onPointClick={setPinnedPoint}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
