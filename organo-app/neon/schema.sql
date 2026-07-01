create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key,
  email text not null unique,
  full_name text not null default '',
  platform_role text not null default 'user' check (platform_role in ('platform_admin','user')),
  access_status text not null default 'pending' check (access_status in ('pending','active','suspended','revoked')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null default 'agency' check (organization_type in ('agency','office','client')),
  status text not null default 'active' check (status in ('trial','active','suspended','closed')),
  owner_user_id text not null references public.profiles(id),
  logo_url text,
  brand_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','admin','manager','analyst','content_editor','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended','removed')),
  created_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  website_url text,
  business_type text,
  contact_name text,
  contact_email text,
  status text not null default 'active' check (status in ('lead','active','paused','archived')),
  created_by text references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  user_id text references public.profiles(id) on delete set null,
  session_id text,
  url text not null,
  final_url text,
  overall_score integer not null,
  seo_score integer not null,
  geo_score integer not null,
  aeo_score integer not null,
  performance_score integer not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id text references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  requester_email text not null,
  request_type text not null check (request_type in ('access','correction','deletion','export','objection','other')),
  details text,
  status text not null default 'received' check (status in ('received','verifying','processing','completed','rejected')),
  handled_by text references public.profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  organization_id uuid references public.organizations(id) on delete cascade,
  role text not null default 'viewer',
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by text references public.profiles(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

create index if not exists scans_org_created_idx on public.scans (organization_id,created_at desc);
create index if not exists scans_client_created_idx on public.scans (client_id,created_at desc);
create index if not exists clients_org_idx on public.clients (organization_id,status);
create index if not exists audit_org_created_idx on public.audit_logs (organization_id,created_at desc);
create unique index if not exists invitations_pending_email_idx on public.invitations (lower(email)) where status='pending';
