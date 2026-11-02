-- Trivia Squares: repeatable, READ-ONLY six-language content inventory.
-- Scope: trivia_squares only. Does not read player records or other schemas.
-- This is an inventory and structural check, NOT independent fact verification.
-- A source URL / automated GeoNames match is NOT proof of human fact checking.
-- Run as read-only SQL; do not count unsourced or unapproved rows as verified.
--
-- Geography categories are the current six-language DB labels. Update the
-- allowlist if category names change. "unique_text" checks exact normalized
-- question wording only, not semantic duplicates (e.g. city phrasing).
WITH languages(locale) AS (
  VALUES ('he'), ('en'), ('ru'), ('fr'), ('ar'), ('es')
),
q AS (
  SELECT locale,
    count(*) FILTER (WHERE active IS TRUE) AS active,
    count(DISTINCT lower(btrim(question))) FILTER (WHERE active IS TRUE) AS unique_text,
    count(*) FILTER (
      WHERE active IS TRUE
      AND category IN (
        'גאוגרפיה', 'Geography', 'World geography', 'География',
        'Géographie', 'الجغرافيا', 'Geografía', 'Geografía · ciudades'
      )
    ) AS geography,
    count(*) FILTER (
      WHERE active IS TRUE AND (
        jsonb_typeof(answers) <> 'array'
        OR jsonb_array_length(answers) <> 4
        OR correct_index NOT BETWEEN 0 AND 3
      )
    ) AS malformed
  FROM trivia_squares.questions
  GROUP BY locale
),
p AS (
  SELECT q.locale, count(DISTINCT q.id) AS sourced_active
  FROM trivia_squares.questions q
  JOIN trivia_squares.question_provenance p
    ON p.question_id = q.id AND p.locale = q.locale
  WHERE q.active IS TRUE
  GROUP BY q.locale
),
r AS (
  SELECT locale,
    count(*) FILTER (
      WHERE approved IS TRUE AND released_at IS NULL
    ) AS approved_waiting,
    count(*) FILTER (
      WHERE approved IS NOT TRUE AND released_at IS NULL
    ) AS not_approved_waiting
  FROM trivia_squares.question_reserve
  GROUP BY locale
)
SELECT l.locale,
  coalesce(q.active, 0) AS active,
  coalesce(q.unique_text, 0) AS unique_text,
  coalesce(q.geography, 0) AS geography,
  coalesce(q.malformed, 0) AS malformed,
  coalesce(p.sourced_active, 0) AS sourced_active,
  coalesce(q.active, 0) - coalesce(p.sourced_active, 0) AS lacking_provenance,
  coalesce(r.approved_waiting, 0) AS approved_waiting,
  coalesce(r.not_approved_waiting, 0) AS not_approved_waiting
FROM languages l
LEFT JOIN q USING (locale)
LEFT JOIN p USING (locale)
LEFT JOIN r USING (locale)
ORDER BY l.locale;

-- A second, structural check for distinct answer choices. No data mutation.
SELECT locale,
  count(*) FILTER (
    WHERE active IS TRUE AND (
      SELECT count(DISTINCT lower(btrim(choice)))
      FROM jsonb_array_elements_text(answers) AS choice
    ) <> 4
  ) AS duplicate_answer_sets
FROM trivia_squares.questions
WHERE locale IN ('he', 'en', 'ru', 'fr', 'ar', 'es')
GROUP BY locale
ORDER BY locale;
