create extension if not exists pgcrypto;

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
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

create index if not exists scans_session_created_idx
  on public.scans (session_id, created_at desc);

alter table public.scans enable row level security;

-- The Vercel server uses SUPABASE_SERVICE_ROLE_KEY. Never expose it in NEXT_PUBLIC variables.
