-- Normalize the remaining Spanish *distractor* spellings, not only correct
-- country answers. Keep each option in its original index and preserve all IDs.
-- Applied only where the canonical spelling is not already another option.
-- Idempotent: on rerun no old spellings remain, so updates=0.
with updated as (
 update trivia_squares.questions q set answers=(
  select jsonb_agg(
   to_jsonb(case a.value
    when 'Côte d’Ivoire' then 'Costa de Marfil'
    when 'Islas Aland' then 'Islas Åland'
    when 'Timor-Leste' then 'Timor Oriental'
    else a.value end) order by a.n
  )
  from jsonb_array_elements_text(q.answers) with ordinality a(value,n)
 )
 where q.active and q.locale='es'
 and (q.answers ? 'Côte d’Ivoire' or q.answers ? 'Islas Aland' or q.answers ? 'Timor-Leste')
 and not (
  (q.answers ? 'Côte d’Ivoire' and q.answers ? 'Costa de Marfil') or
  (q.answers ? 'Islas Aland' and q.answers ? 'Islas Åland') or
  (q.answers ? 'Timor-Leste' and q.answers ? 'Timor Oriental')
 )
 returning q.id
)
select count(*) as corrected_spanish_distractor_questions from updated;
