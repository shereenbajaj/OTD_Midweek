-- Close the dashboard functions to the browser. Only the otd-dash Edge Function
-- (service role, after checking the MetaGo sign-in) may call them.
-- Apply AFTER the otd-dash function is deployed, or the live page loses data until it is.

revoke execute on function public.otd_dash_weekly_summary()     from public, anon, authenticated;
revoke execute on function public.otd_dash_campaign_stats()     from public, anon, authenticated;
revoke execute on function public.otd_dash_campaign_week(date)  from public, anon, authenticated;
revoke execute on function public.otd_dash_cohorts()            from public, anon, authenticated;

grant execute on function public.otd_dash_weekly_summary()     to service_role;
grant execute on function public.otd_dash_campaign_stats()     to service_role;
grant execute on function public.otd_dash_campaign_week(date)  to service_role;
grant execute on function public.otd_dash_cohorts()            to service_role;

-- Check: every row should show anon = false.
-- select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'otd_dash_%';
