-- Daily challenge leaderboard (2026-11-04). Same 10 questions for everyone each day; one score per device per day.
-- Table is RLS-locked with no policies: only the SECURITY DEFINER functions below read or write it.
create table if not exists trivia_squares.daily_scores(
  id bigint generated always as identity primary key,
  day date not null,
  locale text not null check (locale in ('he','en','ru','fr','ar','es')),
  client_id uuid not null,
  name text not null check (char_length(name) between 2 and 32),
  correct integer not null check (correct between 0 and 10),
  seconds integer not null check (seconds between 10 and 3600),
  score integer not null,
  created_at timestamptz not null default now(),
  unique (day, locale, client_id)
);
alter table trivia_squares.daily_scores enable row level security;
revoke all on trivia_squares.daily_scores from anon, authenticated;
create index if not exists daily_scores_rank on trivia_squares.daily_scores(day, locale, score desc, seconds asc);

create or replace function public.trivia_daily_submit(p_day date, p_locale text, p_client_id uuid, p_name text, p_correct integer, p_seconds integer)
returns table(rank bigint, players bigint, score integer)
language plpgsql security definer set search_path to ''
as $$
declare v_name text; v_score integer;
begin
  if p_client_id is null then raise exception 'invalid client'; end if;
  if p_day is null or p_day < (now() at time zone 'utc')::date - 1 or p_day > (now() at time zone 'utc')::date + 1 then raise exception 'invalid day'; end if;
  if p_locale not in ('he','en','ru','fr','ar','es') then raise exception 'invalid locale'; end if;
  if p_correct is null or p_correct not between 0 and 10 then raise exception 'invalid score'; end if;
  if p_seconds is null or p_seconds not between 10 and 3600 then raise exception 'invalid time'; end if;
  v_name := btrim(regexp_replace(coalesce(p_name,''), '[[:cntrl:]]', '', 'g'));
  if char_length(v_name) not between 2 and 32 or v_name ~* '(https?:|www\.|\.com|\.co\.il)' then raise exception 'invalid name'; end if;
  v_score := p_correct * 100 + greatest(0, 300 - p_seconds);
  insert into trivia_squares.daily_scores(day, locale, client_id, name, correct, seconds, score)
  values (p_day, p_locale, p_client_id, v_name, p_correct, p_seconds, v_score)
  on conflict (day, locale, client_id) do nothing;
  return query
    select (select count(*) + 1 from trivia_squares.daily_scores d2
             where d2.day = p_day and d2.locale = p_locale and (d2.score > d.score or (d2.score = d.score and d2.id < d.id))) as rank,
           (select count(*) from trivia_squares.daily_scores d3 where d3.day = p_day and d3.locale = p_locale) as players,
           d.score
    from trivia_squares.daily_scores d
    where d.day = p_day and d.locale = p_locale and d.client_id = p_client_id;
end $$;

create or replace function public.trivia_daily_top(p_day date, p_locale text)
returns table(place bigint, name text, correct integer, seconds integer, score integer)
language sql stable security definer set search_path to ''
as $$
  select row_number() over (order by d.score desc, d.id asc), d.name, d.correct, d.seconds, d.score
  from trivia_squares.daily_scores d
  where d.day = p_day and d.locale = p_locale
  order by d.score desc, d.id asc limit 10
$$;

revoke all on function public.trivia_daily_submit(date,text,uuid,text,integer,integer) from public;
revoke all on function public.trivia_daily_top(date,text) from public;
grant execute on function public.trivia_daily_submit(date,text,uuid,text,integer,integer) to anon, authenticated;
grant execute on function public.trivia_daily_top(date,text) to anon, authenticated;
