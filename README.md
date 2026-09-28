# OTD Midweek — Ad Campaigns Weekly Review

Weekly review dashboard for Ketto OTD (one-time donation) **ad campaigns**. MetaGo staff only.

## Files
- `index.html` — the dashboard, a single self-contained page.
- `dashboard.template.html` — the same page without the `<html>`/`<head>`/`<body>` wrapper.
- `supabase/functions/otd-dash/` — the Edge Function that checks the sign-in and returns the data.
- `supabase/migrations/` — closes the `otd_dash_*` database functions to everyone except that Edge Function.

## Sign-in and data
1. The page shows a **Sign in with MetaGo** screen. Sign-in goes through MetaGo Central Auth (`auth.metago.health`, Google login), using the OAuth authorization-code + PKCE flow. The sign-in lasts for the browser tab.
2. With the resulting access token, the page calls the `otd-dash` Edge Function. It checks the token against `https://auth.metago.health/.well-known/jwks.json` (RS256, issuer, audience = this dashboard's client id, expiry, `typ = access`) and the email domain (default `metago.health`), then runs one of:
   - `otd_dash_weekly_summary()` → `otd_weekly_summary` (category = `ad`)
   - `otd_dash_campaign_stats()`, `otd_dash_campaign_week(w date)`, `otd_dash_cohorts()` → `otd_weekly_campaigns` (category = `ad`), names from `otd_monthly_campaigns`
3. The page has no built-in data. Nothing loads until someone signs in, and the raw tables and `otd_dash_*` functions can't be read from the browser.
4. Inside Claude, the page skips the MetaGo sign-in and reads Supabase through the viewer's own Supabase connector.

## Setup
1. **Register the dashboard at auth.metago.health** (auth team): a public OAuth client with PKCE, and the page's address as an allowed redirect URI (e.g. `https://shereenbajaj.github.io/OTD_Midweek/`). The CORS settings for `/oauth/token` must allow that origin.
2. **Set the client id** in `index.html`: `AUTH.clientId` (and `AUTH.scope` if the auth service needs one). Rebuild `dashboard.template.html` to match.
3. **Deploy the Edge Function** (Supabase CLI, project `njgctrmitailbvjtyeiz`):
   ```sh
   supabase secrets set METAGO_AUDIENCE=<client id> ALLOWED_ORIGINS=https://shereenbajaj.github.io --project-ref njgctrmitailbvjtyeiz
   supabase functions deploy otd-dash --no-verify-jwt --project-ref njgctrmitailbvjtyeiz
   ```
   Optional secrets: `ALLOWED_EMAIL_DOMAINS` (default `metago.health`, comma-separated, `*` = anyone signed in), `ALLOWED_ROLES`, `METAGO_ISSUER`.
4. **Lock the database functions**: run `supabase/migrations/20260928000000_otd_dash_service_role_only.sql` (SQL editor, or `supabase db push`). Do this after step 3.
5. **Host the page**: GitHub → Settings → Pages → deploy from `main` / root.

## Definitions
- Orders = orders placed. Donations exclude tips. Order conversion = orders placed ÷ unique visitors.
- All ratios are calculated from the raw counts. Weeks start Monday. Campaign-level data starts the week of 1 Jun 2026.
