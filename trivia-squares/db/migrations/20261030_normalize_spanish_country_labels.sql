-- Normalize 29 correct-answer country labels in the Spanish GeoNames city questions.
-- The original values refer to the same countries. This aligns Spanish spelling
-- with the project's vetted country-label dictionary; IDs, indices and scores stay intact.
-- Checked against city-fact + country-label records; safe to rerun (0 changes).
begin;
with parsed as (
 select q.id,q.answers,q.correct_index,q.answers->>q.correct_index as old_answer,
 coalesce(substring(q.question from '^¿A qué país pertenece la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está situada la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país se encuentra la ciudad de (.+)\?$'),substring(q.question from '^¿En qué país está la ciudad de (.+)\?$'),substring(q.question from '^La ciudad de (.+), ¿en qué país se ubica\?$'),substring(q.question from '^¿Qué país tiene una ciudad llamada (.+)\?$'),substring(q.question from '^¿En qué país se encuentra (.+)\?$')) as city
 from trivia_squares.questions q
 where q.active and q.locale='es' and q.category ~* 'geografía'
), reference as (
 select p.id,p.answers,p.correct_index,p.old_answer,l.es as standard_answer
 from parsed p
 join trivia_squares.geography_city_facts f on f.city=p.city
 join trivia_squares.geography_country_labels l on l.code=f.country_code
 where p.old_answer is distinct from l.es
 and not exists (
  select 1 from jsonb_array_elements_text(p.answers) with ordinality a(answer,n)
  where a.n<>p.correct_index+1 and a.answer=l.es
 )
), corrected as (
 update trivia_squares.questions q
 set answers=jsonb_set(q.answers,array[q.correct_index::text],to_jsonb(r.standard_answer),false)
 from reference r
 where q.id=r.id and q.locale='es' and q.answers->>q.correct_index=r.old_answer
 returning q.id
)
select count(*) as normalized_spanish_correct_answers from corrected;
commit;
