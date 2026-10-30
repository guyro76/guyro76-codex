-- Spanish geography contains two phrasings of the exact same city/country
-- for 3,161 cities. Retain the source-backed 'Geografía' version and
-- deactivate only the redundant 'Geografía · ciudades' duplicate.
-- No deletion, no change to question IDs, no change to any players' saved state.
-- All country labels must agree, otherwise that pair is left untouched.
-- Safe/idempotent on repeated deployment.
begin;
with parsed as (
 select q.id,q.category,q.answers->>q.correct_index as answer,
 coalesce(substring(q.question from '^¿A qué país pertenece la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está situada la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país se encuentra la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está la ciudad de (.+)\?$'),substring(q.question from '^La ciudad de (.+), ¿en qué país se ubica\?$'),substring(q.question from '^¿Qué país tiene una ciudad llamada (.+)\?$'),substring(q.question from '^¿En qué país se encuentra (.+)\?$')) as city
 from trivia_squares.questions q
 where q.active and q.locale='es' and q.category ~* 'geografía'
), ranked as (
 select p.*,row_number() over(
  partition by city order by case when category='Geografía' then 0 else 1 end,id
 ) rn from parsed p where city is not null
), candidates as (
 select r.id from ranked r
 join ranked keeper on keeper.city=r.city and keeper.rn=1
 where r.rn>1 and r.category='Geografía · ciudades' and r.answer=keeper.answer
), deactivated as (
 update trivia_squares.questions q set active=false
 from candidates c
 where q.id=c.id and q.locale='es' and q.active
 and not exists (
  select 1 from trivia_squares.matches m
  where m.status='playing' and m.state->'pending'->>'question_id'=q.id::text
 )
 returning q.id
)
select count(*) as deactivated_redundant_spanish_city_questions from deactivated;
commit;
