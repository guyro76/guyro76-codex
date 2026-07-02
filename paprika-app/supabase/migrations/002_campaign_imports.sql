create table if not exists public.data_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  platform text not null default 'unknown',
  source_type text not null,
  file_name text,
  status text not null default 'processing',
  row_count integer not null default 0,
  detected_columns text[] not null default '{}',
  warnings jsonb not null default '[]',
  summary jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_rows (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_id uuid not null references public.data_imports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  platform text not null default 'unknown',
  report_date date,
  campaign_name text,
  ad_group_name text,
  ad_name text,
  keyword text,
  search_term text,
  spend numeric not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  conversions numeric not null default 0,
  conversion_value numeric not null default 0,
  ctr numeric not null default 0,
  cpc numeric not null default 0,
  cpm numeric not null default 0,
  conversion_rate numeric not null default 0,
  roas numeric not null default 0,
  frequency numeric not null default 0,
  raw jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists data_imports_org_created_idx on public.data_imports(organization_id, created_at desc);
create index if not exists campaign_rows_import_idx on public.campaign_rows(import_id);
create index if not exists campaign_rows_org_platform_idx on public.campaign_rows(organization_id, platform);
