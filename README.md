# OTD Midweek — Ad Campaigns Weekly Review

Weekly review dashboard for Ketto OTD (one-time donation) **ad campaigns**.

## Files
- `index.html` — the dashboard, a single self-contained page. Open it in a browser.
- `dashboard.template.html` — same page with `__SNAP__` in place of the embedded snapshot data (used to rebuild `index.html`).

## Data
- **Snapshot (embedded):** weekly `ad` rows from `otd_weekly_summary`, 3 Nov 2025 – 14 Sep 2026. This is what the page shows when opened on its own.
- **Live, hosted page (GitHub Pages etc.):** "Load live data" asks for a work email, sends a one-time sign-in link (Supabase Auth), then calls read-only database functions:
  - `otd_dash_weekly_summary()`, `otd_dash_campaign_stats()`, `otd_dash_campaign_week(w date)`, `otd_dash_cohorts()`, `otd_dash_access()`
  - Only signed-in users whose email domain is in `private.otd_dash_allowed_domains` get data (currently `metago.health`). Add a domain with:
    `insert into private.otd_dash_allowed_domains(domain) values ('ketto.org');`
  - The page uses the project's publishable key, which is safe to publish; access is enforced in the database.
- **Live, inside Claude:** when opened as a Claude artifact, "Load live data" queries Supabase through the viewer's Supabase connector:
  - `otd_weekly_summary` (category = `ad`) — headline, funnel, value, tips, weekly table
  - `otd_weekly_campaigns` (category = `ad`) — campaign drill-down, movers, launch-month cohorts
  - `otd_monthly_campaigns` — campaign names (currently August 2026 only)

## One-time setup for the hosted page
1. GitHub → repo Settings → Pages → deploy from `main` / root. Note the URL (e.g. `https://shereenbajaj.github.io/OTD_Midweek/`).
2. Supabase → Authentication → URL Configuration: set **Site URL** to that address and add it under **Redirect URLs**.
3. Supabase → Authentication → Providers → Email: keep enabled (magic links). For more than a few sign-ins per hour, set up custom SMTP.

## Definitions
- Orders = orders placed. Donations exclude tips.
- Order conversion = orders placed ÷ unique visitors.
- All ratios are calculated from the raw counts.
- Weeks start Monday. Campaign-level data starts the week of 1 Jun 2026.
