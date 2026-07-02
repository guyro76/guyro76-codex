alter table public.data_imports enable row level security;
alter table public.campaign_rows enable row level security;
alter table public.recommendations enable row level security;

drop policy if exists "data_imports_select_own" on public.data_imports;
drop policy if exists "data_imports_insert_own" on public.data_imports;
drop policy if exists "data_imports_update_own" on public.data_imports;
drop policy if exists "data_imports_delete_own" on public.data_imports;
create policy "data_imports_member_access" on public.data_imports for all
using (exists (select 1 from public.memberships m where m.organization_id = data_imports.organization_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.memberships m where m.organization_id = data_imports.organization_id and m.user_id = auth.uid()));

drop policy if exists "campaign_rows_select_own" on public.campaign_rows;
drop policy if exists "campaign_rows_insert_own" on public.campaign_rows;
drop policy if exists "campaign_rows_delete_own" on public.campaign_rows;
create policy "campaign_rows_member_access" on public.campaign_rows for all
using (exists (select 1 from public.memberships m where m.organization_id = campaign_rows.organization_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.memberships m where m.organization_id = campaign_rows.organization_id and m.user_id = auth.uid()));

drop policy if exists "recommendations_select_own" on public.recommendations;
drop policy if exists "recommendations_insert_own" on public.recommendations;
drop policy if exists "recommendations_update_own" on public.recommendations;
drop policy if exists "recommendations_delete_own" on public.recommendations;
create policy "recommendations_member_access" on public.recommendations for all
using (exists (select 1 from public.memberships m where m.organization_id = recommendations.organization_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.memberships m where m.organization_id = recommendations.organization_id and m.user_id = auth.uid()));
