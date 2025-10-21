alter table public.profiles enable row level security;
create policy if not exists profiles_select_self on public.profiles for select using (auth.uid() = id);

alter table public.projects enable row level security;
create policy if not exists projects_owner_insert on public.projects for insert with check (auth.uid() = owner_id);
create policy if not exists projects_members_select on public.projects for select using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
);
create policy if not exists projects_members_update on public.projects for update using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
) with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
);

alter table public.project_members enable row level security;
create policy if not exists project_members_select on public.project_members for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.projects pr where pr.id = project_members.project_id and pr.owner_id = auth.uid()
  )
);
create policy if not exists project_members_manage on public.project_members for insert with check (
  exists (
    select 1 from public.projects pr where pr.id = project_members.project_id and pr.owner_id = auth.uid()
  )
);
create policy if not exists project_members_delete on public.project_members for delete using (
  exists (
    select 1 from public.projects pr where pr.id = project_members.project_id and pr.owner_id = auth.uid()
  )
);

alter table public.sites enable row level security;
create policy if not exists sites_select on public.sites for select using (
  exists (
    select 1
    from public.projects pr
    where pr.id = sites.project_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);
create policy if not exists sites_modify on public.sites for insert with check (
  exists (
    select 1
    from public.projects pr
    where pr.id = sites.project_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);
create policy if not exists sites_update on public.sites for update using (
  exists (
    select 1
    from public.projects pr
    where pr.id = sites.project_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);

alter table public.blocks enable row level security;
create policy if not exists blocks_access on public.blocks for all using (
  exists (
    select 1
    from public.sites s
    join public.projects pr on pr.id = s.project_id
    where s.id = blocks.site_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);

alter table public.parcels enable row level security;
create policy if not exists parcels_access on public.parcels for all using (
  exists (
    select 1
    from public.blocks b
    join public.sites s on s.id = b.site_id
    join public.projects pr on pr.id = s.project_id
    where b.id = parcels.block_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);

alter table public.scenarios enable row level security;
create policy if not exists scenarios_select on public.scenarios for select using (
  exists (
    select 1
    from public.sites s
    join public.projects pr on pr.id = s.project_id
    where s.id = scenarios.site_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);
create policy if not exists scenarios_modify on public.scenarios for insert with check (
  exists (
    select 1
    from public.sites s
    join public.projects pr on pr.id = s.project_id
    where s.id = scenarios.site_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);
create policy if not exists scenarios_update on public.scenarios for update using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.sites s
    join public.projects pr on pr.id = s.project_id
    join public.project_members pm on pm.project_id = pr.id
    where s.id = scenarios.site_id and pm.user_id = auth.uid() and pm.role in ('designer', 'manager', 'member')
  )
);

alter table public.scenario_items enable row level security;
create policy if not exists scenario_items_select on public.scenario_items for select using (
  exists (
    select 1
    from public.scenarios sc
    join public.sites s on s.id = sc.site_id
    join public.projects pr on pr.id = s.project_id
    where sc.id = scenario_items.scenario_id and (
      pr.owner_id = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);
create policy if not exists scenario_items_modify on public.scenario_items for all using (
  exists (
    select 1
    from public.scenarios sc
    join public.sites s on s.id = sc.site_id
    join public.projects pr on pr.id = s.project_id
    where sc.id = scenario_items.scenario_id and (
      sc.created_by = auth.uid()
      or exists (
        select 1 from public.project_members pm where pm.project_id = pr.id and pm.user_id = auth.uid()
      )
    )
  )
);

alter table public.cost_params enable row level security;
create policy if not exists cost_params_read on public.cost_params for select using (auth.role() = 'authenticated');

alter table public.mix_rules enable row level security;
create policy if not exists mix_rules_read on public.mix_rules for select using (auth.role() = 'authenticated');

alter table public.rents enable row level security;
create policy if not exists rents_read on public.rents for select using (auth.role() = 'authenticated');

alter table public.overheads enable row level security;
create policy if not exists overheads_read on public.overheads for select using (auth.role() = 'authenticated');
