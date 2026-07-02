alter table public.data_imports enable row level security;
alter table public.campaign_rows enable row level security;
alter table public.recommendations enable row level security;
alter table public.ad_connections enable row level security;
alter table public.audit_events enable row level security;
alter table public.browser_ingest_events enable row level security;

drop policy if exists "data_imports_select_own" on public.data_imports;
create policy "data_imports_select_own" on public.data_imports for select using (auth.uid() = user_id);
drop policy if exists "data_imports_insert_own" on public.data_imports;
create policy "data_imports_insert_own" on public.data_imports for insert with check (auth.uid() = user_id);
drop policy if exists "data_imports_update_own" on public.data_imports;
create policy "data_imports_update_own" on public.data_imports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "data_imports_delete_own" on public.data_imports;
create policy "data_imports_delete_own" on public.data_imports for delete using (auth.uid() = user_id);

drop policy if exists "campaign_rows_select_own" on public.campaign_rows;
create policy "campaign_rows_select_own" on public.campaign_rows for select using (auth.uid() = user_id);
drop policy if exists "campaign_rows_insert_own" on public.campaign_rows;
create policy "campaign_rows_insert_own" on public.campaign_rows for insert with check (auth.uid() = user_id);
drop policy if exists "campaign_rows_delete_own" on public.campaign_rows;
create policy "campaign_rows_delete_own" on public.campaign_rows for delete using (auth.uid() = user_id);

drop policy if exists "recommendations_select_own" on public.recommendations;
create policy "recommendations_select_own" on public.recommendations for select using (auth.uid() = user_id);
drop policy if exists "recommendations_insert_own" on public.recommendations;
create policy "recommendations_insert_own" on public.recommendations for insert with check (auth.uid() = user_id);
drop policy if exists "recommendations_update_own" on public.recommendations;
create policy "recommendations_update_own" on public.recommendations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "recommendations_delete_own" on public.recommendations;
create policy "recommendations_delete_own" on public.recommendations for delete using (auth.uid() = user_id);
