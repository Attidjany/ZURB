create or replace function public.fn_geom_stats(multi_geom geometry)
returns table (area_ha numeric, bbox geometry, centroid geometry) as $$
begin
  if multi_geom is null then
    return query select null::numeric, null::geometry, null::geometry;
  end if;
  return query
  select
    round(st_area(st_setsrid(multi_geom, 4326)::geography) / 10000, 4) as area_ha,
    st_envelope(st_setsrid(multi_geom, 4326)) as bbox,
    st_pointonsurface(st_setsrid(multi_geom, 4326)) as centroid;
end;
$$ language plpgsql stable;

create or replace function public.fn_construction_cost_per_m2(category text)
returns numeric as $$
declare
  params record;
  mix record;
  grams numeric;
  ounces numeric;
  cost numeric;
begin
  select * into params from public.cost_params order by updated_at desc limit 1;
  if params is null then
    raise exception 'Cost parameters missing';
  end if;

  select * into mix from public.mix_rules where category = fn_construction_cost_per_m2.category limit 1;
  if mix is null then
    raise exception 'Mix rule missing for %', category;
  end if;

  grams := params.grams_mid_end * mix.mid_end_pct + params.grams_high_end * mix.high_end_pct + params.grams_outstanding * mix.outstanding_pct;
  ounces := grams / 31.1035;
  cost := ounces * params.gold_usd_per_oz;
  return round(cost, 2);
end;
$$ language plpgsql stable;

create or replace function public.fn_unit_cost(category text, gfa_m2 numeric)
returns numeric as $$
begin
  return public.fn_construction_cost_per_m2(category) * coalesce(gfa_m2, 0);
end;
$$ language plpgsql stable;

create or replace function public.fn_max_capex(
  monthly_rent numeric,
  lease_years int,
  dev_monthly numeric,
  maint_monthly numeric,
  non_construction_capex numeric
) returns numeric as $$
begin
  return (coalesce(monthly_rent, 0) * 12 * coalesce(lease_years, 0)) - ((coalesce(dev_monthly, 0) + coalesce(maint_monthly, 0)) * 12 * coalesce(lease_years, 0)) - coalesce(non_construction_capex, 0);
end;
$$ language plpgsql stable;

create or replace function public.fn_margin(
  category text,
  gfa_m2 numeric,
  monthly_rent numeric,
  lease_years int,
  dev_monthly numeric,
  maint_monthly numeric,
  non_construction_capex numeric
) returns numeric as $$
begin
  return public.fn_max_capex(monthly_rent, lease_years, dev_monthly, maint_monthly, non_construction_capex) - public.fn_unit_cost(category, gfa_m2);
end;
$$ language plpgsql stable;

create or replace function public.fn_upsert_site_geometry(p_site_id uuid, p_geojson jsonb)
returns table (area_ha numeric, bbox geometry, centroid geometry) as $$
declare
  new_geom geometry(multipolygon, 4326);
  stats record;
begin
  if p_geojson is null then
    raise exception 'GeoJSON payload required';
  end if;

  new_geom := st_multi(st_force2d(st_setsrid(st_geomfromgeojson(p_geojson)::geometry, 4326)));

  if st_geometrytype(new_geom) not in ('ST_MultiPolygon', 'ST_Polygon') then
    raise exception 'Geometry must be Polygon or MultiPolygon';
  end if;

  select * into stats from public.fn_geom_stats(new_geom);

  update public.sites
  set geom = new_geom,
      area_ha = stats.area_ha,
      bbox = stats.bbox,
      centroid = stats.centroid
  where id = p_site_id;

  return query select stats.area_ha, stats.bbox, stats.centroid;
end;
$$ language plpgsql volatile security definer set search_path = public, extensions;
