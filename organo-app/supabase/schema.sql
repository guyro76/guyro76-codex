create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
  owner_user_id uuid not null references public.profiles(id),
  logo_url text,
  brand_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
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
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
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
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  requester_email text not null,
  request_type text not null check (request_type in ('access','correction','deletion','export','objection','other')),
  details text,
  status text not null default 'received' check (status in ('received','verifying','processing','completed','rejected')),
  verification_token_hash text,
  handled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists scans_org_created_idx on public.scans (organization_id,created_at desc);
create index if not exists scans_client_created_idx on public.scans (client_id,created_at desc);
create index if not exists clients_org_idx on public.clients (organization_id,status);
create index if not exists audit_org_created_idx on public.audit_logs (organization_id,created_at desc);

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and platform_role='platform_admin' and access_status='active');
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_platform_admin() or exists(
    select 1 from public.organization_members
    where organization_id=org_id and user_id=auth.uid() and status='active'
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_platform_admin() or exists(
    select 1 from public.organization_members
    where organization_id=org_id and user_id=auth.uid() and status='active' and role in ('owner','admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,full_name,platform_role,access_status)
  values(
    new.id,
    lower(coalesce(new.email,'')),
    coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',''),
    case when lower(coalesce(new.email,''))='guyro76@gmail.com' then 'platform_admin' else 'user' end,
    case when lower(coalesce(new.email,''))='guyro76@gmail.com' then 'active' else 'pending' end
  ) on conflict(id) do update set email=excluded.email,updated_at=now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.scans enable row level security;
alter table public.audit_logs enable row level security;
alter table public.privacy_requests enable row level security;

create policy profiles_self_select on public.profiles for select using (id=auth.uid() or public.is_platform_admin());
create policy profiles_admin_update on public.profiles for update using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy organizations_member_select on public.organizations for select using (public.is_org_member(id));
create policy organizations_admin_write on public.organizations for all using (public.is_org_admin(id)) with check (public.is_org_admin(id));
create policy members_member_select on public.organization_members for select using (public.is_org_member(organization_id));
create policy members_admin_write on public.organization_members for all using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy clients_member_select on public.clients for select using (public.is_org_member(organization_id));
create policy clients_staff_write on public.clients for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy scans_member_select on public.scans for select using (organization_id is not null and public.is_org_member(organization_id));
create policy scans_member_insert on public.scans for insert with check (organization_id is not null and public.is_org_member(organization_id) and user_id=auth.uid());
create policy audit_admin_select on public.audit_logs for select using (organization_id is null and public.is_platform_admin() or organization_id is not null and public.is_org_admin(organization_id));
create policy privacy_admin_only on public.privacy_requests for select using (public.is_platform_admin());

insert into public.profiles(id,email,full_name,platform_role,access_status)
select id,lower(email),'גיא רוזנברג','platform_admin','active'
from auth.users where lower(email)='guyro76@gmail.com'
on conflict(id) do update set platform_role='platform_admin',access_status='active',full_name='גיא רוזנברג',updated_at=now();
