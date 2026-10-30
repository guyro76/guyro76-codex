-- Prevent re-release of the same city/country fact with a different
-- Spanish question template. Only explicit city/country geography templates
-- are compared; genuine unrelated questions and all other locales are untouched.
-- Old records stay inactive, never deleted. No new API exposure.
create or replace function trivia_squares.spanish_city_subject(p_question text)
returns text language sql immutable set search_path to '' as $sql$
 select coalesce(substring(p_question from '^¿A qué país pertenece la ciudad de (.+)\?$'),substring(p_question from '^¿En qué país está situada la ciudad de (.+)\?$'),substring(p_question from '^¿En qué país se encuentra la ciudad de (.+)\?$'),substring(p_question from '^¿En qué país está la ciudad de (.+)\?$'),substring(p_question from '^La ciudad de (.+), ¿en qué país se ubica\?$'),substring(p_question from '^¿Qué país tiene una ciudad llamada (.+)\?$'),substring(p_question from '^¿En qué país se encuentra (.+)\?$'))
$sql$;
revoke all on function trivia_squares.spanish_city_subject(text) from public,anon,authenticated;

create or replace function trivia_squares.publish_reviewed_questions(p_count integer default 2)
returns integer language plpgsql set search_path to '' as $function$
declare
 rec trivia_squares.question_reserve%rowtype;
 next_locale text;
 released integer := 0;
 inserted_rows integer := 0;
 max_count integer := least(greatest(coalesce(p_count,2),0),5);
 candidate_city text;
begin
 for next_locale in select unnest(array['he','en','ru','fr','ar','es']::text[]) loop
  for rec in
   select * from trivia_squares.question_reserve
   where locale=next_locale and approved and released_at is null
   order by id limit max_count for update skip locked
  loop
   -- Compare the semantic city key, not just normalized raw question text.
   if rec.locale='es' and rec.category ~* 'geografía' then
    candidate_city := trivia_squares.spanish_city_subject(rec.question);
    if candidate_city is not null and exists(
     select 1 from trivia_squares.questions existing
     where existing.locale='es' and existing.active
      and existing.category ~* 'geografía'
      and trivia_squares.spanish_city_subject(existing.question)=candidate_city
    ) then
     update trivia_squares.question_reserve set approved=false where id=rec.id;
     continue;
    end if;
   end if;
   insert into trivia_squares.questions(category,difficulty,question,answers,correct_index,locale,active)
    select rec.category,rec.difficulty,rec.question,rec.answers,rec.correct_index,rec.locale,true
    where not exists(
     select 1 from trivia_squares.questions existing
     where existing.locale=rec.locale
       and pg_catalog.lower(pg_catalog.btrim(existing.question))
         =pg_catalog.lower(pg_catalog.btrim(rec.question))
    );
   get diagnostics inserted_rows = row_count;
   if inserted_rows = 1 then
    update trivia_squares.question_reserve set released_at=now() where id=rec.id;
    released := released + 1;
   else
    update trivia_squares.question_reserve set approved=false where id=rec.id;
   end if;
  end loop;
 end loop;
 return released;
end $function$;
-- Read-only verification:
select trivia_squares.spanish_city_subject('¿En qué país se encuentra la ciudad de Mariehamn?') as city_a,
 trivia_squares.spanish_city_subject('La ciudad de Mariehamn, ¿en qué país se ubica?') as city_b,
 trivia_squares.publish_reviewed_questions(0) as zero_release_dry_run;
