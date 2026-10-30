-- Trivia Squares: six-locale release inventory audit (read-only).
-- Scope: trivia_squares only. No player data is selected, no writes are performed.
-- Individual provenance is evidence of documentation, NOT proof of factual accuracy.
-- Approved reserve without a direct source URL is NOT counted as verified stock.
-- Exact text dedup does not detect semantic duplicates.
-- Execute with a read-only SQL client and retain the dated output for review.
WITH langs(locale) AS (VALUES ('he'),('en'),('ru'),('fr'),('ar'),('es')),
q AS (
 SELECT locale,
 COUNT(*) FILTER (WHERE active) AS active_count,
 COUNT(*) FILTER (WHERE active AND EXISTS (
   SELECT 1 FROM trivia_squares.question_provenance p
   WHERE p.question_id=questions.id AND p.locale=questions.locale
   AND p.source_url ~* '^https?://' AND p.verified_on IS NOT NULL
 )) AS sourced_count,
 COUNT(*) FILTER (WHERE active AND category ~* '(math|מתמט|математ|رياضيات|mathématique|matemát)') AS math_category_count,
 COUNT(*) FILTER (WHERE active AND (
   question IS NULL OR btrim(question)='' OR
   CASE WHEN jsonb_typeof(answers)='array' THEN jsonb_array_length(answers)<>4 ELSE true END
   OR correct_index NOT BETWEEN 0 AND 3
 )) AS malformed_count
 FROM trivia_squares.questions GROUP BY locale
),
r AS (
 SELECT locale,
 COUNT(*) FILTER (WHERE approved AND released_at IS NULL) AS flagged_approved,
 COUNT(*) FILTER (WHERE approved AND released_at IS NULL AND source_note !~* 'https?://') AS approved_without_source_url,
 COUNT(*) FILTER (WHERE released_at IS NOT NULL) AS released,
 COUNT(*) FILTER (WHERE NOT approved AND released_at IS NULL) AS unapproved
 FROM trivia_squares.question_reserve GROUP BY locale
),
d AS (
 SELECT locale, COUNT(*) AS duplicate_groups FROM (
  SELECT locale, lower(btrim(question)) AS normalized
  FROM trivia_squares.questions WHERE active
  GROUP BY locale, lower(btrim(question)) HAVING COUNT(*) > 1
 ) x GROUP BY locale
)
SELECT l.locale, coalesce(q.active_count,0) active_count,
coalesce(q.sourced_count,0) with_individual_source_record,
greatest(5000-coalesce(q.sourced_count,0),0) minimum_provenance_gap,
coalesce(q.math_category_count,0) math_category_count,
coalesce(q.malformed_count,0) malformed_count,
coalesce(d.duplicate_groups,0) exact_duplicate_groups,
coalesce(r.flagged_approved,0) flagged_approved_reserve,
coalesce(r.approved_without_source_url,0) reserve_missing_url,
coalesce(r.released,0) reserve_released,
coalesce(r.unapproved,0) reserve_unapproved
FROM langs l LEFT JOIN q ON q.locale=l.locale LEFT JOIN r ON r.locale=l.locale LEFT JOIN d ON d.locale=l.locale
ORDER BY CASE l.locale WHEN 'he' THEN 1 WHEN 'en' THEN 2 WHEN 'ru' THEN 3 WHEN 'fr' THEN 4 WHEN 'ar' THEN 5 ELSE 6 END;
