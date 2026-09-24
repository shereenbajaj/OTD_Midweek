# OTD Midweek — Ad Campaigns Weekly Review

Weekly review dashboard for Ketto OTD (one-time donation) **ad campaigns**.

## Files
- `index.html` — the dashboard, a single self-contained page.
- `dashboard.template.html` — same page with `__SNAP__` in place of the embedded snapshot data.

## Data
- The page loads the latest data from Supabase automatically every time it opens — no sign-in, no button.
- It calls read-only database functions with the project's publishable key:
  - `otd_dash_weekly_summary()` → `otd_weekly_summary` (category = `ad`)
  - `otd_dash_campaign_stats()`, `otd_dash_campaign_week(w)`, `otd_dash_cohorts()` → `otd_weekly_campaigns` (category = `ad`), names from `otd_monthly_campaigns`
- The raw tables stay closed (RLS); only these functions' outputs are readable. Anyone with the page link can see the dashboard numbers.
- If Supabase can't be reached, the page falls back to the embedded snapshot (3 Nov 2025 – 14 Sep 2026).

## Hosting
GitHub → Settings → Pages → deploy from `main` / root.

## Definitions
- Orders = orders placed. Donations exclude tips. Order conversion = orders placed ÷ unique visitors.
- All ratios are calculated from the raw counts. Weeks start Monday. Campaign-level data starts the week of 1 Jun 2026.
