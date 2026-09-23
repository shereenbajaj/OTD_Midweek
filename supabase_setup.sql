-- Already applied to project njgctrmitailbvjtyeiz as migration "otd_dashboard_readonly_api".
-- Kept here for reference. To allow another email domain:
insert into private.otd_dash_allowed_domains(domain) values ('ketto.org') on conflict do nothing;
-- To see who's allowed:
select * from private.otd_dash_allowed_domains;
