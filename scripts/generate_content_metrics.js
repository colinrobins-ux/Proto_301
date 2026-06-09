import fs from 'node:fs';
import path from 'node:path';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const weekPattern = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, precision = 1) => Math.round(value * precision) / precision;
const rand = (min, max) => Math.random() * (max - min) + min;

const buildData = () => {
  const result = [];
  for (let index = 0; index < 24; index += 1) {
    const year = 2024 + Math.floor(index / 12);
    const month = index % 12;
    const monthLabel = monthNames[month];
    const monthIndex = year === 2024 ? month : month + 12;

    const trend = 150000 + monthIndex * 6200;
    const seasonalSpike = [0, 0, 0, 18000, 0, 0, 0, 22000, 0, 0, 0, 24000][month] || 0;
    const views = Math.round(trend + seasonalSpike + rand(-7000, 7000));
    const churnBase = 2.1 + Math.sin((month / 12) * Math.PI * 2) * 0.7 + rand(-0.3, 0.3);
    const churn = round(clamp(churnBase + (month === 0 || month === 2 || month === 8 ? 0.6 : 0), 1.7, 5.8), 100);
    const engagement = round(clamp(4 + Math.cos((month / 12) * Math.PI * 2) * 2.5 + rand(-0.8, 0.8), 2.8, 11.8), 10);
    const publishVolume = Math.round(clamp(14 + Math.sin((month / 12) * Math.PI * 2) * 5 + rand(-2, 2), 10, 28));
    const timeOnPage = Math.round(clamp(75 + Math.cos((month / 12) * Math.PI * 2) * 40 + rand(-15, 15), 55, 230));
    const signups = Math.round(clamp(1700 + monthIndex * 70 + Math.sin((month / 6) * Math.PI) * 450 + rand(-220, 220), 1200, 5400));
    const adRevenue = Math.round((views * 0.058 + rand(-9000, 9000)) / 10) * 10;

    const display = Math.round(adRevenue * rand(0.36, 0.45));
    const preRoll = Math.round(adRevenue * rand(0.27, 0.35));
    const sponsored = Math.max(0, adRevenue - display - preRoll);

    const weeks = [];
    const weekCount = weekPattern[month];
    let weekView = views;
    let weekRevenue = adRevenue;

    for (let w = 0; w < weekCount; w += 1) {
      const weekRatio = 1 / weekCount;
      const baseWeeklyViews = Math.round(views * weekRatio + rand(-5000, 5000));
      const baseWeeklyRevenue = Math.round(adRevenue * weekRatio + rand(-2100, 2100));
      const weeklyEngagement = round(clamp(engagement + rand(-1.4, 1.4), 2.2, 12.0), 10);
      weeks.push({
        weekLabel: `W${w + 1} ${monthLabel}`,
        content_views: baseWeeklyViews,
        ad_revenue: Math.max(18000, baseWeeklyRevenue),
        engagement_rate: weeklyEngagement,
      });
    }

    result.push({
      month: monthLabel,
      year,
      content_views: views,
      subscriber_churn: churn,
      ad_revenue: adRevenue,
      engagement_rate: engagement,
      content_publish_volume: publishVolume,
      avg_time_on_page: timeOnPage,
      new_subscriber_signups: signups,
      revenue_breakdown: {
        display,
        pre_roll: preRoll,
        sponsored,
      },
      week: weeks,
    });
  }

  return result;
};

const output = buildData();
const outputPath = path.resolve('./src/data/content_metrics.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Generated ${output.length} months of content metrics to ${outputPath}`);
