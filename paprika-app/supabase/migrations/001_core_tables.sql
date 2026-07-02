create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  plan text not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'analyst',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  industry text not null default '',
  platform text not null default 'שניהם',
  monthly_budget numeric not null default 0,
  monthly_fee numeric not null default 0,
  roas numeric not null default 0,
  target_roas numeric not null default 0,
  cpa numeric not null default 0,
  leads integer not null default 0,
  health integer not null default 75,
  manager text not null default '',
  status text not null default 'בהקמה',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  client_name text not null default '',
  due_label text not null default '',
  priority text not null default 'בינונית',
  status text not null default 'לביצוע',
  owner text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null default '',
  title text not null,
  details text not null default '',
  severity text not null default 'medium',
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  period_start date,
  period_end date,
  status text not null default 'draft',
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  provider text not null default 'manual',
  external_customer_id text,
  external_subscription_id text,
  status text not null default 'trial',
  plan text not null default 'trial',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_org_idx on public.clients(organization_id, status);
create index if not exists tasks_org_idx on public.agency_tasks(organization_id, status);
create index if not exists alerts_org_idx on public.alerts(organization_id, resolved, severity);
create index if not exists reports_org_idx on public.reports(organization_id, created_at desc);
