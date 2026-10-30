-- Trivia Squares: minimum documented-source gate for reserve publication.
-- A URL is necessary, not sufficient, evidence of factual correctness.
-- Human/editorial verification and duplicate checks must happen before approved=true.
-- No existing question, player progress, wallet or other schema is modified.
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
   -- Prevent approval flags with generic editorial notes from becoming live content.
   -- This only checks presence of a public source URL; it does not claim fact verification.
   if coalesce(rec.source_note,'') !~* 'https?://[[:alnum:]][^[:space:]]+' then
    update trivia_squares.question_reserve set approved=false where id=rec.id;
    continue;
   end if;
   -- Preserve semantic Spanish city deduplication from PR #46.
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

-- Non-destructive smoke check. p_count=0 never selects reserve rows.
select trivia_squares.publish_reviewed_questions(0) as expected_zero_releases;
