create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  import_id uuid references public.data_imports(id) on delete set null,
  provider text not null default 'unknown',
  severity text not null default 'medium',
  category text not null,
  entity_name text,
  title text not null,
  explanation text not null,
  evidence jsonb not null default '[]',
  expected_impact text,
  confidence integer not null default 0,
  suggested_action text,
  rollback_plan text,
  status text not null default 'pending',
  requires_approval boolean not null default true,
  reviewed_at timestamptz,
  implemented_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  external_account_id text,
  account_name text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'pending',
  metadata jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  reason text,
  source text not null default 'paprika_web',
  created_at timestamptz not null default now()
);

create table if not exists public.browser_ingest_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  page_url text,
  page_title text,
  visible_text text,
  extracted_tables jsonb not null default '[]',
  screenshot_path text,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

alter table public.recommendations add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.recommendations add column if not exists client_name text not null default '';
alter table public.ad_connections add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.audit_events add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.browser_ingest_events add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

create index if not exists recommendations_org_status_idx on public.recommendations(organization_id, status, severity);
create index if not exists ad_connections_org_provider_idx on public.ad_connections(organization_id, provider);
create index if not exists audit_events_org_created_idx on public.audit_events(organization_id, created_at desc);
create index if not exists browser_ingest_org_created_idx on public.browser_ingest_events(organization_id, created_at desc);
