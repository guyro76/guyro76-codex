-- Trivia Squares: verified question reports. Applied to social-hub (trivia_squares)
-- Dedicated schema, owner-only authenticated RPC; no cross-project changes.
create table if not exists trivia_squares.question_reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id bigint not null references trivia_squares.questions(id) on delete cascade,
  reason text not null check (reason in ('wrong_answer','unclear','translation','duplicate','outdated')),
  created_at timestamptz not null default now(),
  unique (user_id,question_id)
);
alter table trivia_squares.question_reports enable row level security;
revoke all on table trivia_squares.question_reports from public,anon,authenticated;
create or replace function public.trivia_report_question(p_question_id bigint,p_reason text)
returns boolean language plpgsql security definer set search_path='' as $function$
declare uid uuid := (select auth.uid());
begin
 if uid is null then raise exception 'Sign in required' using errcode='28000';end if;
 if p_reason not in ('wrong_answer','unclear','translation','duplicate','outdated') then
  raise exception 'Unsupported report reason';end if;
 if not exists(select 1 from trivia_squares.questions where id=p_question_id) then
  raise exception 'Question ID is not in the reviewed question bank';end if;
 insert into trivia_squares.question_reports(user_id,question_id,reason)
 values(uid,p_question_id,p_reason)
 on conflict (user_id,question_id) do update set reason=excluded.reason,created_at=now();
 return true;
end;
$function$;
revoke all on function public.trivia_report_question(bigint,text) from public;
grant execute on function public.trivia_report_question(bigint,text) to authenticated;
