-- Trivia Squares: answer appeals, question reports for guests, and an audited correction log.
-- Owner-approved 2026-11-03. Additive only: two new tables and four functions; nothing is dropped or rewritten.
-- Players (anon or signed in) can only: submit an appeal, read their own appeals by device id,
-- claim an approved appeal's compensation once, and read corrections to questions bundled in the app
-- (their answers already ship in the public app bundle). Server question answers stay private.

create table if not exists trivia_squares.answer_appeals(
  id bigint generated always as identity primary key,
  client_id uuid not null,
  user_id uuid null,
  kind text not null check (kind in ('appeal','report')),
  source text not null check (source in ('bundled','server')),
  question_id bigint not null check (question_id > 0),
  locale text not null check (locale in ('he','en','ru','fr','ar','es')),
  question_text text not null check (char_length(question_text) between 3 and 400),
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) between 2 and 6),
  chosen_index integer null,
  shown_correct_index integer null,
  reason text null check (reason is null or char_length(reason) <= 300),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decision_note text null check (decision_note is null or char_length(decision_note) <= 400),
  decided_at timestamptz null,
  compensation_claimed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (client_id, kind, source, question_id)
);
create index if not exists answer_appeals_status_idx on trivia_squares.answer_appeals(status, created_at);
alter table trivia_squares.answer_appeals enable row level security;
revoke all on table trivia_squares.answer_appeals from public, anon, authenticated;

create table if not exists trivia_squares.question_corrections(
  id bigint generated always as identity primary key,
  source text not null check (source in ('bundled','server')),
  question_id bigint not null,
  locale text not null,
  action text not null check (action in ('fix','retire')),
  old_value jsonb not null,
  new_value jsonb null,
  reason text not null,
  evidence_url text null,
  appeal_id bigint null references trivia_squares.answer_appeals(id),
  created_at timestamptz not null default now(),
  check (action = 'retire' or new_value is not null)
);
create index if not exists question_corrections_source_idx on trivia_squares.question_corrections(source, created_at);
alter table trivia_squares.question_corrections enable row level security;
revoke all on table trivia_squares.question_corrections from public, anon, authenticated;

create or replace function public.trivia_submit_answer_appeal(
  p_client_id uuid, p_kind text, p_source text, p_question_id bigint, p_locale text,
  p_question text, p_answers jsonb, p_chosen integer, p_shown_correct integer, p_reason text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_count integer; v_len integer;
begin
  if p_client_id is null or p_kind not in ('appeal','report') or p_source not in ('bundled','server') then
    raise exception 'invalid appeal'; end if;
  if p_question_id is null or p_question_id <= 0 then raise exception 'invalid question'; end if;
  if p_locale not in ('he','en','ru','fr','ar','es') then raise exception 'invalid locale'; end if;
  if p_question is null or char_length(p_question) not between 3 and 400 then raise exception 'invalid question text'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then raise exception 'invalid answers'; end if;
  v_len := jsonb_array_length(p_answers);
  if v_len not between 2 and 6 or exists (select 1 from jsonb_array_elements(p_answers) e
      where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') > 200) then raise exception 'invalid answers'; end if;
  if p_chosen is not null and (p_chosen < 0 or p_chosen >= v_len) then raise exception 'invalid choice'; end if;
  if p_shown_correct is not null and (p_shown_correct < 0 or p_shown_correct >= v_len) then raise exception 'invalid choice'; end if;
  if p_reason is not null and char_length(p_reason) > 300 then raise exception 'reason too long'; end if;
  select count(*) into v_count from trivia_squares.answer_appeals
    where client_id = p_client_id and created_at > now() - interval '1 day';
  if v_count >= 20 then raise exception 'daily appeal limit reached'; end if;
  select count(*) into v_count from trivia_squares.answer_appeals where created_at > now() - interval '1 hour';
  if v_count >= 1000 then raise exception 'appeals are paused, try again later'; end if;
  insert into trivia_squares.answer_appeals(client_id,user_id,kind,source,question_id,locale,question_text,answers,
      chosen_index,shown_correct_index,reason)
    values (p_client_id,auth.uid(),p_kind,p_source,p_question_id,p_locale,p_question,p_answers,p_chosen,p_shown_correct,
      nullif(btrim(p_reason),''))
    on conflict (client_id,kind,source,question_id) do nothing
    returning id into v_id;
  if v_id is null then
    select id into v_id from trivia_squares.answer_appeals
      where client_id = p_client_id and kind = p_kind and source = p_source and question_id = p_question_id;
  end if;
  return v_id;
end $$;

create or replace function public.trivia_my_appeals(p_client_id uuid)
returns table(id bigint, kind text, source text, question_id bigint, locale text, status text,
  decision_note text, decided_at timestamptz, compensation_claimed boolean)
language sql stable security definer set search_path = '' as $$
  select a.id, a.kind, a.source, a.question_id, a.locale, a.status, a.decision_note, a.decided_at,
    a.compensation_claimed_at is not null
  from trivia_squares.answer_appeals a
  where p_client_id is not null and a.client_id = p_client_id
  order by a.id desc limit 50
$$;

create or replace function public.trivia_claim_appeal_compensation(p_client_id uuid, p_appeal_id bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_row trivia_squares.answer_appeals%rowtype; v_server boolean := false;
begin
  update trivia_squares.answer_appeals set compensation_claimed_at = now()
    where id = p_appeal_id and client_id = p_client_id and kind = 'appeal' and status = 'approved'
      and compensation_claimed_at is null
    returning * into v_row;
  if v_row.id is null then return jsonb_build_object('ok', false); end if;
  if v_row.source = 'server' and v_row.user_id is not null and v_row.user_id = auth.uid() then
    update trivia_squares.progress set credits = credits + 25, updated_at = now() where user_id = auth.uid();
    v_server := found;
  end if;
  return jsonb_build_object('ok', true, 'credits', 25, 'server_credited', v_server, 'question_id', v_row.question_id);
end $$;

create or replace function public.trivia_bundled_question_corrections()
returns table(question_id bigint, locale text, action text, new_value jsonb, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.question_id, c.locale, c.action, c.new_value, c.created_at
  from trivia_squares.question_corrections c
  where c.source = 'bundled'
  order by c.id
$$;

revoke all on function public.trivia_submit_answer_appeal(uuid,text,text,bigint,text,text,jsonb,integer,integer,text) from public;
revoke all on function public.trivia_my_appeals(uuid) from public;
revoke all on function public.trivia_claim_appeal_compensation(uuid,bigint) from public;
revoke all on function public.trivia_bundled_question_corrections() from public;
grant execute on function public.trivia_submit_answer_appeal(uuid,text,text,bigint,text,text,jsonb,integer,integer,text) to anon, authenticated;
grant execute on function public.trivia_my_appeals(uuid) to anon, authenticated;
grant execute on function public.trivia_claim_appeal_compensation(uuid,bigint) to anon, authenticated;
grant execute on function public.trivia_bundled_question_corrections() to anon, authenticated;
