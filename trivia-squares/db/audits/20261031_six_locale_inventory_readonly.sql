-- Trivia Squares / social-hub: read-only six-locale content audit.
-- Run only against the existing trivia_squares schema. NO INSERT/UPDATE/DELETE/DDL.
-- Counts are inventory, NOT independent fact verification. A source URL is NOT proof of correctness.
-- Localized geography labels are intentional: category is NOT the English key 'geography'.
-- "other_topics" excludes only the bulk city-geography categories; it is not a verified diversity score.
-- For released reserve provenance join reserve.question to questions.question, not reserve.id to questions.id.

WITH locales(locale) AS (VALUES ('he'),('en'),('ru'),('fr'),('ar'),('es')),
q AS (
 SELECT q.locale,
 count(*) FILTER (WHERE q.active) AS active,
 count(*) FILTER (WHERE q.active AND q.category IN
  ('גאוגרפיה','Geography','География','Géographie','الجغرافيا','Geografía','Geografía · ciudades')) AS geography_core,
 count(*) FILTER (WHERE q.active AND EXISTS (
  SELECT 1 FROM trivia_squares.question_provenance p
  WHERE p.question_id=q.id AND p.locale=q.locale
 )) AS sourced_active,
 count(*) FILTER (WHERE q.active AND
  (jsonb_typeof(q.answers) IS DISTINCT FROM 'array'
   OR CASE WHEN jsonb_typeof(q.answers)='array' THEN jsonb_array_length(q.answers)<>4 ELSE true END
   OR q.correct_index IS NULL OR q.correct_index NOT BETWEEN 0 AND 3)) AS invalid_answer_shape
 FROM trivia_squares.questions q
 GROUP BY q.locale
),
r AS (
 SELECT locale,
 count(*) FILTER (WHERE approved AND released_at IS NULL) AS approved_pending,
 count(*) FILTER (WHERE NOT approved AND released_at IS NULL) AS unapproved_pending,
 count(*) FILTER (WHERE released_at IS NOT NULL) AS released
 FROM trivia_squares.question_reserve GROUP BY locale
)
SELECT l.locale,coalesce(q.active,0) active,
 coalesce(q.geography_core,0) geography_core,
 coalesce(q.active,0)-coalesce(q.geography_core,0) other_topics,
 coalesce(q.sourced_active,0) active_with_provenance,
 coalesce(q.active,0)-coalesce(q.sourced_active,0) active_without_provenance,
 coalesce(q.invalid_answer_shape,0) invalid_answer_shape,
 coalesce(r.approved_pending,0) approved_pending,
 coalesce(r.unapproved_pending,0) unapproved_pending,
 coalesce(r.released,0) released
FROM locales l LEFT JOIN q USING(locale) LEFT JOIN r USING(locale)
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],l.locale);

-- Content integrity. Zero exact duplicates does not rule out semantic duplicates.
SELECT
 (SELECT count(*) FROM trivia_squares.seen_questions) AS seen_rows,
 (SELECT count(*) FROM (
   SELECT locale,lower(btrim(question))
   FROM trivia_squares.questions WHERE active
   GROUP BY 1,2 HAVING count(*)>1
 ) duplicates) AS exact_duplicate_groups,
 (SELECT count(*) FROM trivia_squares.questions q WHERE q.active
  AND EXISTS (SELECT 1 FROM jsonb_array_elements_text(
               CASE WHEN jsonb_typeof(q.answers)='array' THEN q.answers ELSE '[]'::jsonb END) a
              GROUP BY lower(btrim(a)) HAVING count(*)>1)) AS repeated_answer_options;

-- RLS enabled is a necessary condition, NOT proof of correct end-to-end authorization.
SELECT c.relname AS table_name,c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='trivia_squares' AND c.relkind='r'
  AND c.relname IN ('questions','question_reserve','seen_questions',
                    'question_provenance','geography_question_audit')
ORDER BY c.relname;

-- Extra screening for arithmetic prompts and distinct choices in each active locale.
-- Heuristic screening only: zero matches is NOT proof that every question avoids math,
-- and four distinct choices do NOT independently establish a correct answer.
-- Run read-only; inspect any nonzero results before approving new content.
WITH question_checks AS (
 SELECT q.locale,
  (q.question ~* '[[:digit:]][[:space:]]*([+*/=×÷]|-[[:space:]]*[[:digit:]])'
   OR q.question ~* '(מתמטיק|חשבו את|arithmetic|algebra|calculate|calculez|арифметик|вычислите|رياضيات|احسب|matemátic|calcula la suma)') AS possible_arithmetic,
  (SELECT count(DISTINCT lower(btrim(a.value)))
   FROM jsonb_array_elements_text(
    CASE WHEN jsonb_typeof(q.answers)='array' THEN q.answers ELSE '[]'::jsonb END
   ) a(value)) AS distinct_choices
 FROM trivia_squares.questions q
 WHERE q.active
)
SELECT locale,
 count(*) FILTER (WHERE possible_arithmetic) AS arithmetic_review_candidates,
 count(*) FILTER (WHERE distinct_choices<>4) AS non_distinct_four_choice_questions
FROM question_checks
GROUP BY locale
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],locale);
