insert into public.cost_params (gold_usd_per_oz, grams_mid_end, grams_high_end, grams_outstanding)
select 3000, 14.91, 20.9, 26.9
where not exists (select 1 from public.cost_params);

insert into public.mix_rules (category, mid_end_pct, high_end_pct, outstanding_pct) values
  ('A', 0.8, 0.2, 0),
  ('B', 0.6, 0.4, 0),
  ('C', 0, 0.25, 0.75)
on conflict (category) do update
set mid_end_pct = excluded.mid_end_pct,
    high_end_pct = excluded.high_end_pct,
    outstanding_pct = excluded.outstanding_pct;

insert into public.rents (code, monthly_usd) values
  ('AMS', 500),
  ('AML', 600),
  ('AH', 850),
  ('BM', 1000),
  ('BH', 1300),
  ('CH', 3500),
  ('CO', 6000)
on conflict (code) do update set monthly_usd = excluded.monthly_usd;

insert into public.overheads (dev_monthly_usd, maint_monthly_usd, lease_years, infra_subsidy_pct)
select 90, 10, 20, 100
where not exists (select 1 from public.overheads);
