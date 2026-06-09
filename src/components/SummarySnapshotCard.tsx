import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { ResponsiveContainer, Line, LineChart } from 'recharts';
import { ChartPoint } from '../types';

export interface SummaryMetricRow {
  key: string;
  label: string;
  trend: {
    isPositive: boolean;
    formattedDelta: string;
  };
  value: string;
  freq: string;
  sparklineData: ChartPoint[];
}

type SummarySnapshotCardProps = {
  rows: SummaryMetricRow[];
  onMetricClick: (key: string) => void;
};

const SummarySnapshotCard = ({ rows, onMetricClick }: SummarySnapshotCardProps) => (
  <Card className="metric-card" sx={{ height: '100%', minHeight: 360, p: 2, pb: 1.5, display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Summary Snapshot
          </Typography>
          <Typography variant="h6" sx={{ color: '#F0F2F8', mt: 0.5 }}>
            Portfolio health at a glance
          </Typography>
        </Box>
        <Typography variant="caption" color="#AEB7D6">
          Quick-read KPI table for top-level monitoring
        </Typography>
      </Box>
      <TableContainer component={Box} sx={{ borderRadius: 2, overflowX: 'auto', background: '#16181F', width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Table
          size="small"
          sx={{
            minWidth: '100%',
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
            tableLayout: 'fixed',
            height: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none', fontWeight: 600 }}>Metric</TableCell>
              <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none', fontWeight: 600 }}>Trend</TableCell>
              <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none', fontWeight: 600 }}>Figure</TableCell>
              <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none', fontWeight: 600 }}>Sparkline</TableCell>
              <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none', fontWeight: 600 }}>Frequency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                hover
                onClick={() => onMetricClick(row.key)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(91, 141, 239, 0.08)' } }}
              >
                <TableCell sx={{ color: '#F0F2F8', borderBottom: 'none', fontWeight: 600 }}>{row.label}</TableCell>
                <TableCell sx={{ color: row.trend.isPositive ? '#3DD68C' : '#F87171', borderBottom: 'none' }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {row.trend.isPositive ? <ArrowDropUp sx={{ fontSize: 18 }} /> : <ArrowDropDown sx={{ fontSize: 18 }} />}
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.trend.formattedDelta}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#F0F2F8', borderBottom: 'none', fontFamily: 'Roboto Mono, monospace', minWidth: 80, pr: 1 }}>
                  {row.value}
                </TableCell>
                <TableCell sx={{ borderBottom: 'none', px: 0, minWidth: 96 }}>
                  <Box sx={{ width: 90, height: 42, pl: 1, minWidth: 90 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={row.sparklineData}>
                        <Line type="monotone" dataKey={row.key} stroke="#A78BFA" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#AEB7D6', borderBottom: 'none' }}>{row.freq}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

export default SummarySnapshotCard;
