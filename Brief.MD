# Operational Dashboard

## What is this?

A single-page operational dashboard for a **Content Strategy Manager** in the Media & Communications industry. This is a daily command center — not a reporting tool. It surfaces what's performing, what's slipping, and what needs attention before it becomes a problem. Think of it as the first thing you open in the morning: a clear read on content health, audience retention, and revenue signal across your portfolio.

---

## Data

Generate a fake dataset as a JSON file (`src/data/content_metrics.json`).

24 months of data (Jan 2024 – Dec 2025), with weekly breakdowns nested within each month. Each entry should contain:

- **content_views** (integer — total page/video views across all published content, trending upward with periodic spikes tied to publishing cadence)
- **subscriber_churn** (percentage — monthly churn rate, fluctuating between 1.5–6%, with seasonal upticks in Q1 and Q3)
- **ad_revenue** (dollar amount — correlated loosely with content views but with a lag; includes display, pre-roll, and sponsored content blended)
- **engagement_rate** (percentage — likes, comments, shares, saves divided by impressions; range 2–12%, higher on editorial weeks)
- **content_publish_volume** (integer — number of pieces published that week/month; useful to correlate output with performance)
- **avg_time_on_page** (seconds — average session duration per content piece; signals content quality and depth; range 45–240 seconds)
- **new_subscriber_signups** (integer — gross new subscribers before churn is applied; provides net subscriber context alongside churn)

Each month should also include a `week` array with 4–5 entries containing a subset of the above (views, engagement_rate, ad_revenue) for weekly drill-down filtering.

---

## Layout

Use a component framework of your choice (Vue + Vuetify, or React + MUI/Tailwind). Structure as follows:

**App Bar (top)**
- Dashboard title: "Content Command Center"
- Role label: "Content Strategy Manager"
- Global time filter: dropdown with options — `This Week`, `This Month`, `Last 30 Days`, `Month Picker (specific)`, `Year to Date`
- Secondary toggle: `Weekly View` / `Monthly View` — controls granularity of all charts simultaneously

**Row 1 — KPI Summary Cards (7 cards, scrollable on mobile)**

Each card displays the primary metric value, a trend indicator (up/down arrow + delta % vs. prior period), and a subtle sparkline for the last 8 periods:

1. Content Views
2. Subscriber Churn Rate
3. Ad Revenue
4. Engagement Rate
5. Publish Volume
6. Avg. Time on Page
7. New Subscriber Signups

**Row 2 — Primary Charts (2 columns)**

- **Left:** Bar chart — Content Views by month (or by week when weekly view is active). Bars colored by performance tier (above/below rolling average).
- **Right:** Line chart — Subscriber Churn Rate over time, with a reference line showing the target churn threshold (e.g., 3.0%). Fills red above threshold, green below.

**Row 3 — Secondary Charts (2 columns)**

- **Left:** Stacked area chart — Ad Revenue broken down by type (display, pre-roll, sponsored). Shows composition change over time.
- **Right:** Dual-axis line chart — Engagement Rate (left axis) overlaid with Publish Volume (right axis, dashed). Reveals the relationship between output cadence and audience response.

**Row 4 — Full-Width Detail**

- Scatter plot — Avg. Time on Page (Y axis) vs. Engagement Rate (X axis), with each dot representing one month (or week). Dot size = Content Views. Color = above/below avg engagement. This is the "quality signal" view: high time + high engagement = strong content health.

Use `v-container`, `v-row`, `v-col` (or equivalent grid system) for responsive layout. Cards stack to 2-column on tablet, 1-column on mobile. Charts stack full-width below 768px.

---

## Interactions

**Global Time Filter**
- All KPI cards, charts, and the scatter plot respond to the selected time range simultaneously.
- When `This Week` or weekly view is active, charts display week-over-week data and the filter granularity in the month picker switches to week selector.
- When `This Month` or `Month Picker` is active, charts display month-over-month data; month picker shows a calendar-style selector (Jan–Dec per year).
- When `Year to Date` is active, summary cards show cumulative totals or averages (labeled clearly — e.g., "YTD Avg" vs. "This Month").

**KPI Cards**
- Each card shows delta vs. prior equivalent period (e.g., vs. last week if weekly view, vs. last month if monthly view).
- Up/down arrow with color coding: green for positive directional change, red for negative. Note: for Subscriber Churn, down is good — invert the color logic accordingly.
- Clicking a KPI card highlights its corresponding chart (subtle glow or border pulse) and scrolls to it.

**Charts**
- All charts support hover tooltips showing exact values, period label, and % change from prior period.
- The bar chart (Content Views) supports click-to-drill: clicking a bar in monthly view switches to weekly view for that month.
- The churn line chart reference line is editable — click the threshold value to type a new target. This updates the fill regions dynamically.
- The scatter plot supports hover labels per dot (month/week name, all three metric values). Dots are clickable to pin a tooltip for comparison.

**Mobile Behavior**
- Cards scroll horizontally in a single row on mobile (do not stack into a vertical list — preserve the scan-ability).
- Charts stack full-width and maintain touch-friendly tooltips.

---

## Style

**Aesthetic Direction: Modern Classic with Futurist Edge**

The visual language should feel like a premium editorial publication crossed with a mission-control interface — authoritative and clean, but with intentional moments of precision and tension. Not loud. Not corporate gray. Something a content strategist would actually want to look at every morning.

**Color Palette**

| Role | Value | Usage |
|---|---|---|
| Background | `#0E0F14` | Primary surface — near-black with a blue-black cast |
| Surface | `#16181F` | Card and panel backgrounds |
| Surface Raised | `#1E2029` | Elevated elements, hover states |
| Accent Primary | `#5B8DEF` | Key highlights, active states, primary chart color |
| Accent Secondary | `#A78BFA` | Secondary chart lines, sparklines |
| Positive | `#3DD68C` | Up trends, below-threshold churn |
| Negative | `#F87171` | Down trends, above-threshold churn |
| Text Primary | `#F0F2F8` | Headlines, metric values |
| Text Secondary | `#8B90A7` | Labels, captions, axis text |
| Border | `#2A2D3A` | Card borders, dividers |

**Typography**

- **Display / Metric Values:** `DM Mono` or `Roboto Mono` — monospaced numerics read as precise and intentional, not techy-for-the-sake-of-it. Large, light weight (300), tracked wide.
- **UI Labels & Navigation:** `Inter` — neutral, legible, modern. Medium weight (500) for card labels, regular (400) for captions and axis text.
- **No serif faces.** The futurist edge comes from the spacing and palette, not decorative type.

**Chart Style**
- Dark-themed charts with no heavy grid lines — use subtle horizontal rules only (opacity 15–20%).
- Chart areas use the accent palette: primary blue for main series, violet for secondary, positive/negative fills for threshold-based charts.
- No chart borders. Charts bleed into the card surface.
- Sparklines in KPI cards: single-color, no axes, thin stroke (1.5px).

**Signature Element**
- A thin horizontal rule in `Accent Primary` (`#5B8DEF`) at 1px, full viewport width, sits beneath the app bar as a persistent "horizon line." This single detail separates the navigation layer from the data layer and gives the interface a precision-instrument quality without decoration.

**Spacing & Radius**
- Card border radius: `8px` — not pill-shaped, not sharp. Controlled.
- Generous internal card padding: `24px`.
- Section spacing between rows: `32px`.
- Mobile responsive — use a 12-column grid; cards span 12 on mobile, 6 on tablet, 4 or 3 on desktop depending on row.
