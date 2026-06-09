import { AppBar, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material';
import { FilterOption } from '../types';

type DashboardHeaderProps = {
  timeFilter: FilterOption;
  setTimeFilter: (value: FilterOption) => void;
  filterOptions: readonly string[];
  view: 'weekly' | 'monthly';
  setView: (value: 'weekly' | 'monthly') => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  monthOptions: string[];
};

const DashboardHeader = ({
  timeFilter,
  setTimeFilter,
  filterOptions,
  view,
  setView,
  selectedMonth,
  setSelectedMonth,
  monthOptions,
}: DashboardHeaderProps) => (
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
            {monthOptions.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </Toolbar>
    <Box className="solid-horizon" />
  </AppBar>
);

export default DashboardHeader;
