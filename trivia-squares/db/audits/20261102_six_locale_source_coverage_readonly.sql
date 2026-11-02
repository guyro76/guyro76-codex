-- Trivia Squares: six-locale source-coverage and reserve-readiness audit.
-- 2026-11-02. READ ONLY. Scope: trivia_squares only.
-- No approvals, release, migration, writes, player access or billing.
-- Editorial source metadata is NOT independent fact verification.
-- GeoNames automated cross-checks are NOT independent fact verification.
-- Exact question-text uniqueness does NOT prove semantic uniqueness.
-- Run against the existing social-hub database, trivia_squares schema.
WITH locale_codes(locale) AS (
  VALUES ('he'), ('en'), ('ru'), ('fr'), ('ar'), ('es')
),
question_counts AS (
  SELECT locale,
    count(*) FILTER (WHERE active) AS active_count,
    count(DISTINCT lower(btrim(question))) FILTER (WHERE active) AS unique_question_texts,
    count(*) FILTER (WHERE active AND (
      jsonb_typeof(answers) IS DISTINCT FROM 'array'
      OR jsonb_array_length(answers) <> 4
      OR correct_index NOT BETWEEN 0 AND 3
    )) AS malformed_answers
  FROM trivia_squares.questions GROUP BY locale
),
source_counts AS (
  SELECT q.locale, count(*) AS active_with_editorial_source_metadata
  FROM trivia_squares.questions q
  JOIN trivia_squares.question_provenance p
    ON p.question_id = q.id AND p.locale = q.locale
  WHERE q.active AND p.source_url ~ '^https?://' AND p.verified_on IS NOT NULL
  GROUP BY q.locale
),
geo_counts AS (
  SELECT q.locale, count(*) AS active_geonames_audited
  FROM trivia_squares.geography_question_audit a
  JOIN trivia_squares.questions q ON q.id = a.question_id
  WHERE q.active GROUP BY q.locale
),
reserve_counts AS (
  SELECT locale,
    count(*) FILTER (WHERE approved AND released_at IS NULL) AS approved_unreleased,
    count(*) FILTER (WHERE NOT approved AND released_at IS NULL) AS unapproved_unreleased,
    count(*) FILTER (WHERE released_at IS NOT NULL) AS released
  FROM trivia_squares.question_reserve GROUP BY locale
)
SELECT l.locale,
  coalesce(q.active_count,0) AS active_count,
  coalesce(q.unique_question_texts,0) AS unique_question_texts,
  coalesce(s.active_with_editorial_source_metadata,0) AS source_metadata_count,
  coalesce(g.active_geonames_audited,0) AS geonames_automated_audit_count,
  coalesce(r.approved_unreleased,0) AS approved_reserve,
  coalesce(r.unapproved_unreleased,0) AS unapproved_reserve,
  coalesce(r.released,0) AS released_reserve,
  coalesce(q.malformed_answers,0) AS malformed_answers,
  greatest(0,5000-coalesce(q.active_count,0)) AS record_count_shortfall,
  greatest(0,5000-coalesce(s.active_with_editorial_source_metadata,0))
    AS source_metadata_shortfall_not_editorial_verification
FROM locale_codes l
LEFT JOIN question_counts q USING(locale)
LEFT JOIN source_counts s USING(locale)
LEFT JOIN geo_counts g USING(locale)
LEFT JOIN reserve_counts r USING(locale)
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],l.locale);
