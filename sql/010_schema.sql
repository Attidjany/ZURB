create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  geom geometry(multipolygon, 4326),
  area_ha numeric,
  bbox geometry(polygon, 4326),
  centroid geometry(point, 4326),
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  geom geometry(polygon, 4326) not null,
  area_m2 numeric,
  perimeter_m numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.blocks(id) on delete cascade,
  geom geometry(polygon, 4326) not null,
  area_m2 numeric,
  frontage_m numeric,
  depth_m numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.cost_params (
  id uuid primary key default gen_random_uuid(),
  gold_usd_per_oz numeric not null,
  grams_mid_end numeric not null,
  grams_high_end numeric not null,
  grams_outstanding numeric not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.mix_rules (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  mid_end_pct numeric not null,
  high_end_pct numeric not null,
  outstanding_pct numeric not null
);

create table if not exists public.rents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  monthly_usd numeric not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.overheads (
  id uuid primary key default gen_random_uuid(),
  dev_monthly_usd numeric not null default 90,
  maint_monthly_usd numeric not null default 10,
  lease_years int not null default 20,
  infra_subsidy_pct numeric not null default 100
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  notes text,
  created_by uuid not null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.scenario_items (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  parcel_id uuid references public.parcels(id) on delete set null,
  typology_code text not null,
  units int not null,
  gfa_m2 numeric not null,
  overrides jsonb,
  created_at timestamptz not null default now()
);
