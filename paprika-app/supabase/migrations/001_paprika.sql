create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text not null default '',
  platform text not null default 'שניהם' check (platform in ('Google Ads','Meta Ads','שניהם')),
  monthly_budget numeric not null default 0 check (monthly_budget >= 0),
  roas numeric not null default 0 check (roas >= 0),
  health integer not null default 75 check (health between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.agency_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null default '',
  title text not null,
  due_label text not null default '',
  priority text not null default 'בינונית' check (priority in ('גבוהה','בינונית','נמוכה')),
  status text not null default 'לביצוע' check (status in ('לביצוע','בטיפול','הושלם')),
  created_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists agency_tasks_user_id_idx on public.agency_tasks(user_id);
create index if not exists agency_tasks_client_id_idx on public.agency_tasks(client_id);

alter table public.clients enable row level security;
alter table public.agency_tasks enable row level security;

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.agency_tasks;
create policy "tasks_select_own" on public.agency_tasks for select using (auth.uid() = user_id);
drop policy if exists "tasks_insert_own" on public.agency_tasks;
create policy "tasks_insert_own" on public.agency_tasks for insert with check (auth.uid() = user_id);
drop policy if exists "tasks_update_own" on public.agency_tasks;
create policy "tasks_update_own" on public.agency_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "tasks_delete_own" on public.agency_tasks;
create policy "tasks_delete_own" on public.agency_tasks for delete using (auth.uid() = user_id);
