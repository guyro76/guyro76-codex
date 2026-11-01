-- Trivia Squares - read-only GeoNames audit consistency and answer-drift checks.
-- 2026-11-01. Scope: trivia_squares.geography_question_audit and questions ONLY.
-- No DDL, inserts, updates, deletions, approval, release or player access.
-- This checks whether stored answer text still matches the historical audit,
-- NOT whether the GeoNames record or any trivia fact is independently correct.
-- A source URL is metadata, NOT editorial fact verification.
--
-- Output 1: audit integrity by locale. All anomaly columns should be zero.
WITH audited AS (
 SELECT q.locale, q.id AS question_id, a.geonameid, q.active,
        lower(btrim(q.answers ->> q.correct_index)) AS live_answer,
        lower(btrim(a.checked_answer)) AS checked_answer,
        a.source_url,
        count(*) OVER (PARTITION BY q.locale, a.geonameid) AS city_rows
 FROM trivia_squares.geography_question_audit a
 JOIN trivia_squares.questions q ON q.id=a.question_id
)
SELECT locale, count(*) AS audit_rows,
       count(DISTINCT geonameid) AS unique_city_ids,
       count(*) FILTER (WHERE NOT active) AS inactive_rows,
       count(*) FILTER (WHERE live_answer IS DISTINCT FROM checked_answer) AS answer_drift,
       count(*) FILTER (WHERE coalesce(source_url,'') !~ '^https?://') AS missing_source_url,
       count(*) FILTER (WHERE city_rows>1) AS duplicate_city_rows
FROM audited
GROUP BY locale
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],locale);

-- Output 2: concrete anomalous rows for investigation. No mutation.
WITH audited AS (
 SELECT q.locale, q.id AS question_id, a.geonameid, q.active,
        q.answers ->> q.correct_index AS live_answer,
        a.checked_answer, a.source_url,
        count(*) OVER (PARTITION BY q.locale, a.geonameid) AS city_rows
 FROM trivia_squares.geography_question_audit a
 JOIN trivia_squares.questions q ON q.id=a.question_id
)
SELECT locale,question_id,geonameid,active,live_answer,checked_answer,
       source_url,city_rows
FROM audited
WHERE NOT active
   OR lower(btrim(live_answer)) IS DISTINCT FROM lower(btrim(checked_answer))
   OR coalesce(source_url,'') !~ '^https?://'
   OR city_rows>1
ORDER BY locale,geonameid,question_id
LIMIT 100;

-- Output 3: missing locale coverage per audited city, if any.
-- This is not a guarantee of semantic uniqueness outside the audited set.
SELECT geonameid, count(DISTINCT q.locale) AS locales_present,
       string_agg(DISTINCT q.locale, ', ' ORDER BY q.locale) AS locale_codes
FROM trivia_squares.geography_question_audit a
JOIN trivia_squares.questions q ON q.id=a.question_id
GROUP BY geonameid
HAVING count(DISTINCT q.locale) <> 6
ORDER BY geonameid
LIMIT 100;
