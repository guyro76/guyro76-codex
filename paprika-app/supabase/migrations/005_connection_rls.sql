alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.clients enable row level security;
alter table public.agency_tasks enable row level security;
alter table public.alerts enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ad_connections enable row level security;
alter table public.audit_events enable row level security;
alter table public.browser_ingest_events enable row level security;

create policy "profiles_self" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations_owner_read" on public.organizations for select using (owner_id = auth.uid());
create policy "organizations_owner_create" on public.organizations for insert with check (owner_id = auth.uid());
create policy "organizations_owner_update" on public.organizations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "memberships_self_read" on public.memberships for select using (user_id = auth.uid());
create policy "memberships_owner_create" on public.memberships for insert with check (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid()));

create policy "clients_member_access" on public.clients for all using (exists (select 1 from public.memberships m where m.organization_id = clients.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = clients.organization_id and m.user_id = auth.uid()));
create policy "tasks_member_access" on public.agency_tasks for all using (exists (select 1 from public.memberships m where m.organization_id = agency_tasks.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = agency_tasks.organization_id and m.user_id = auth.uid()));
create policy "alerts_member_access" on public.alerts for all using (exists (select 1 from public.memberships m where m.organization_id = alerts.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = alerts.organization_id and m.user_id = auth.uid()));
create policy "reports_member_access" on public.reports for all using (exists (select 1 from public.memberships m where m.organization_id = reports.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = reports.organization_id and m.user_id = auth.uid()));
create policy "subscriptions_owner_read" on public.subscriptions for select using (exists (select 1 from public.organizations o where o.id = subscriptions.organization_id and o.owner_id = auth.uid()));

create policy "connections_member_access" on public.ad_connections for all using (exists (select 1 from public.memberships m where m.organization_id = ad_connections.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = ad_connections.organization_id and m.user_id = auth.uid()));
create policy "audit_member_read" on public.audit_events for select using (exists (select 1 from public.memberships m where m.organization_id = audit_events.organization_id and m.user_id = auth.uid()));
create policy "audit_member_insert" on public.audit_events for insert with check (exists (select 1 from public.memberships m where m.organization_id = audit_events.organization_id and m.user_id = auth.uid()));
create policy "browser_member_access" on public.browser_ingest_events for all using (exists (select 1 from public.memberships m where m.organization_id = browser_ingest_events.organization_id and m.user_id = auth.uid())) with check (exists (select 1 from public.memberships m where m.organization_id = browser_ingest_events.organization_id and m.user_id = auth.uid()));
