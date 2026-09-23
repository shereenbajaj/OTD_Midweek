# OTD Midweek — Ad Campaigns Weekly Review

Weekly review dashboard for Ketto OTD (one-time donation) **ad campaigns**.

## Files
- `index.html` — the dashboard, a single self-contained page. Open it in a browser.
- `dashboard.template.html` — same page with `__SNAP__` in place of the embedded snapshot data (used to rebuild `index.html`).

## Data
- **Snapshot (embedded):** weekly `ad` rows from `otd_weekly_summary`, 3 Nov 2025 – 14 Sep 2026. This is what the page shows when opened on its own.
- **Live (inside Claude only):** when opened as a Claude artifact, "Load live data" queries Supabase through the viewer's Supabase connector:
  - `otd_weekly_summary` (category = `ad`) — headline, funnel, value, tips, weekly table
  - `otd_weekly_campaigns` (category = `ad`) — campaign drill-down, movers, launch-month cohorts
  - `otd_monthly_campaigns` — campaign names (currently August 2026 only)
- Opened outside Claude, the campaign and cohort sections can't load and show a notice instead.

## Definitions
- Orders = orders placed. Donations exclude tips.
- Order conversion = orders placed ÷ unique visitors.
- All ratios are calculated from the raw counts.
- Weeks start Monday. Campaign-level data starts the week of 1 Jun 2026.
