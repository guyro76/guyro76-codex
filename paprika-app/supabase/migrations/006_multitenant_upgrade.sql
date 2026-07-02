alter table public.data_imports add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.campaign_rows add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.recommendations add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.recommendations add column if not exists client_name text not null default '';
alter table public.ad_connections add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.audit_events add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.browser_ingest_events add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

create index if not exists data_imports_org_idx on public.data_imports(organization_id, created_at desc);
create index if not exists campaign_rows_org_idx on public.campaign_rows(organization_id, platform);
create index if not exists recommendations_org_idx on public.recommendations(organization_id, status, severity);
create index if not exists connections_org_idx on public.ad_connections(organization_id, provider);
create index if not exists audit_org_idx on public.audit_events(organization_id, created_at desc);
create index if not exists browser_ingest_org_idx on public.browser_ingest_events(organization_id, created_at desc);
