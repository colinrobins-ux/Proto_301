export interface WeeklyPoint {
  weekLabel: string;
  content_views: number;
  engagement_rate: number;
  ad_revenue: number;
  subscriber_churn?: number;
  content_publish_volume?: number;
  avg_time_on_page?: number;
  revenue_breakdown?: {
    display: number;
    pre_roll: number;
    sponsored: number;
  };
}

export interface MonthlyEntry {
  month: string;
  year: number;
  content_views: number;
  subscriber_churn: number;
  ad_revenue: number;
  engagement_rate: number;
  content_publish_volume: number;
  avg_time_on_page: number;
  new_subscriber_signups: number;
  revenue_breakdown: {
    display: number;
    pre_roll: number;
    sponsored: number;
  };
  week: WeeklyPoint[];
}

export const filterOptions = [
  'This Week',
  'This Month',
  'Last 30 Days',
  'Month Picker',
  'Year to Date',
] as const;

export type FilterOption = (typeof filterOptions)[number];

export interface ChartPoint {
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
}

export interface ScatterPoint {
  label: string;
  x: number;
  y: number;
  z: number;
  color: string;
  value: ChartPoint;
}
