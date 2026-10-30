-- Correct answers are meaningful even when no square is captured.
-- 5 virtual credits and 10 knowledge points per correct answer.
-- Closed squares keep their additional 10 credits and territory score.
-- Existing scores, credits, all player progress and IDs are preserved.
-- Auth/ownership checks and row lock are left exactly as in original RPC.
alter table trivia_squares.progress
  add column if not exists knowledge_points integer not null default 0;

CREATE OR REPLACE FUNCTION public.trivia_answer(p_match uuid, p_answer integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid := (select auth.uid());
declare m trivia_squares.matches%rowtype;
declare s jsonb;
declare role text; declare turn text; declare key text; declare q trivia_squares.questions%rowtype;
declare r integer; declare c integer; declare gained integer:=0; declare correct boolean;
declare nextturn text;declare name text;declare score integer;declare streak integer;declare tokens integer;
begin
 if uid is null then raise exception 'Sign in required' using errcode='28000'; end if;
 if p_answer not between 0 and 3 then raise exception 'Invalid answer'; end if;
 select * into m from trivia_squares.matches where id=p_match for update;
 if not found or m.status<>'playing' or not (m.state ? 'pending') then raise exception 'No pending question'; end if;
 s:=m.state; turn:=s->>'turn';role:=case when uid=m.host_id then 'host' when uid=m.guest_id then 'guest' else null end;
 if role is null then raise exception 'Unauthorized'; end if;
 if s->>'mode'='local' then role:=turn; end if;
 if role<>turn then raise exception 'Not your turn'; end if;
 if s->'pending'->>'deadline_at' is not null and pg_catalog.now() >= (s->'pending'->>'deadline_at')::timestamptz then raise exception 'Question time expired'; end if;
 key:=s->'pending'->>'edge';
 select * into q from trivia_squares.questions where id=(s->'pending'->>'question_id')::bigint;
 if not found then raise exception 'Missing question'; end if;
 correct:=p_answer=q.correct_index;
 s := s || pg_catalog.jsonb_build_object(
 'streak',coalesce(s->'streak',pg_catalog.jsonb_build_object('host',0,'guest',0,'bot',0)),
 'bonus_ready',coalesce(s->'bonus_ready',pg_catalog.jsonb_build_object('host',false,'guest',false,'bot',false)),
 'bonus_tokens',coalesce(s->'bonus_tokens',pg_catalog.jsonb_build_object('host',0,'guest',0,'bot',0))
 );
 if s->'pending'->>'kind'='bonus' then
   s:=s-'pending';
   s:=pg_catalog.jsonb_set(s,ARRAY['bonus_ready',turn],'false'::jsonb,true);
   tokens:=coalesce((s->'bonus_tokens'->>turn)::integer,0);
   if correct then
      tokens:=least(4,tokens+2);
      s:=pg_catalog.jsonb_set(s,ARRAY['bonus_tokens',turn],pg_catalog.to_jsonb(tokens),true);
   end if;
   if correct and s->>'mode'<>'local' and (turn='host' or turn='guest') then
     insert into trivia_squares.progress(user_id,credits,knowledge_points)
       values(uid,5,10)
       on conflict(user_id) do update set
         credits=trivia_squares.progress.credits+excluded.credits,
         knowledge_points=trivia_squares.progress.knowledge_points+excluded.knowledge_points,
         updated_at=pg_catalog.now();
   end if;
   update trivia_squares.matches set state=s,version=version+1 where id=p_match;
   return pg_catalog.jsonb_build_object('bonus',true,'correct',correct,'correct_index',q.correct_index,'tokens',tokens,'state',s,'finished',false);
 end if;
 s:=s-'pending';
 streak:=case when correct then coalesce((s->'streak'->>turn)::integer,0)+1 else 0 end;
 s:=pg_catalog.jsonb_set(s,ARRAY['streak',turn],pg_catalog.to_jsonb(streak),true);
 if correct and pg_catalog.mod(streak,3)=0 and s->>'mode'<>'online' then
   s:=pg_catalog.jsonb_set(s,ARRAY['bonus_ready',turn],'true'::jsonb,true);
 end if;
 if correct then
  s:=pg_catalog.jsonb_set(s,ARRAY['edges',key],pg_catalog.to_jsonb(turn),true);
  for r in 0..(s->>'rows')::integer-1 loop
   for c in 0..(s->>'cols')::integer-1 loop
    name:=r::text||'-'||c::text;
    if not ((s->'owners') ? name) and (s->'edges') ? ('h-'||r||'-'||c)
     and (s->'edges') ? ('h-'||(r+1)||'-'||c)
     and (s->'edges') ? ('v-'||r||'-'||c)
     and (s->'edges') ? ('v-'||r||'-'||(c+1)) then
      s:=pg_catalog.jsonb_set(s,ARRAY['owners',name],pg_catalog.to_jsonb(turn),true);
      gained:=gained+1;
    end if;
   end loop;
  end loop;
  score:=(s->'scores'->>turn)::integer+gained;
  s:=pg_catalog.jsonb_set(s,ARRAY['scores',turn],pg_catalog.to_jsonb(score),true);
 end if;
 if not correct or gained=0 then
  nextturn:=case when turn='host' then case when s->>'mode'='bot' then 'bot' else 'guest' end else 'host' end;
  s:=pg_catalog.jsonb_set(s,'{turn}',pg_catalog.to_jsonb(nextturn));
 end if;
 if ((s->'scores'->>'host')::integer+(s->'scores'->>'guest')::integer+(s->'scores'->>'bot')::integer)=(s->>'rows')::integer*(s->>'cols')::integer then
  update trivia_squares.matches set state=s,status='completed',version=version+1 where id=p_match;
 else
  update trivia_squares.matches set state=s,version=version+1 where id=p_match;
 end if;
 if correct and (turn='host' or turn='guest') and s->>'mode'<>'local' then
  insert into trivia_squares.progress(user_id,credits,fruits,knowledge_points) values(uid,5+gained*10,gained,10)
  on conflict (user_id) do update set credits=trivia_squares.progress.credits+excluded.credits,fruits=trivia_squares.progress.fruits+excluded.fruits,knowledge_points=trivia_squares.progress.knowledge_points+excluded.knowledge_points,updated_at=pg_catalog.now();
 end if;
 return pg_catalog.jsonb_build_object('correct',correct,'correct_index',q.correct_index,'gained',gained,'turn',s->>'turn','finished',(s->'scores'->>'host')::integer+(s->'scores'->>'guest')::integer+(s->'scores'->>'bot')::integer=(s->>'rows')::integer*(s->>'cols')::integer,'state',s);
end $function$


comment on column trivia_squares.progress.knowledge_points is
'Non-transferable quiz mastery score: +10 for each correct authenticated answer. Territory scores remain separate.';
