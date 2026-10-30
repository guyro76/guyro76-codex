-- Read-only release-gate audit. Run against social-hub / trivia_squares only.
-- It reports evidence gaps; it does NOT certify correctness of any question.
with locales(locale) as (values ('he'),('en'),('ru'),('fr'),('ar'),('es'))
select l.locale,
 (select count(*) from trivia_squares.questions q where q.locale=l.locale and q.active) as active_rows,
 (select count(*) from trivia_squares.question_reserve r where r.locale=l.locale and r.approved and r.released_at is null) as approved_reserve,
 (select count(*) from trivia_squares.question_reserve r where r.locale=l.locale and r.approved and r.released_at is null and coalesce(r.source_note,'') !~* 'https?://[[:alnum:]][^[:space:]]+') as approved_without_url,
 (select count(*) from trivia_squares.question_reserve r where r.locale=l.locale and not r.approved and r.released_at is null) as awaiting_review,
 (select count(*) from trivia_squares.question_provenance p join trivia_squares.questions q on q.id=p.question_id where q.locale=l.locale and q.active and nullif(trim(p.source_url),'') is not null) as source_documented
from locales l order by l.locale;
-- A passing source-URL presence check is not a passing factual review.
