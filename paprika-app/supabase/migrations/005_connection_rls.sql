drop policy if exists "ad_connections_select_own" on public.ad_connections;
create policy "ad_connections_select_own" on public.ad_connections for select using (auth.uid() = user_id);
drop policy if exists "ad_connections_insert_own" on public.ad_connections;
create policy "ad_connections_insert_own" on public.ad_connections for insert with check (auth.uid() = user_id);
drop policy if exists "ad_connections_update_own" on public.ad_connections;
create policy "ad_connections_update_own" on public.ad_connections for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ad_connections_delete_own" on public.ad_connections;
create policy "ad_connections_delete_own" on public.ad_connections for delete using (auth.uid() = user_id);

drop policy if exists "audit_events_select_own" on public.audit_events;
create policy "audit_events_select_own" on public.audit_events for select using (auth.uid() = user_id);
drop policy if exists "audit_events_insert_own" on public.audit_events;
create policy "audit_events_insert_own" on public.audit_events for insert with check (auth.uid() = user_id);

drop policy if exists "browser_ingest_select_own" on public.browser_ingest_events;
create policy "browser_ingest_select_own" on public.browser_ingest_events for select using (auth.uid() = user_id);
drop policy if exists "browser_ingest_insert_own" on public.browser_ingest_events;
create policy "browser_ingest_insert_own" on public.browser_ingest_events for insert with check (auth.uid() = user_id);
drop policy if exists "browser_ingest_update_own" on public.browser_ingest_events;
create policy "browser_ingest_update_own" on public.browser_ingest_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "browser_ingest_delete_own" on public.browser_ingest_events;
create policy "browser_ingest_delete_own" on public.browser_ingest_events for delete using (auth.uid() = user_id);
