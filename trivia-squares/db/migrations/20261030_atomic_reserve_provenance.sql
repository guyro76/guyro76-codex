-- Trivia Squares / social-hub only. Additive, isolated, and deliberately NOT applied by this file's creation.
-- A source URL and an explicit editorial verification date are prerequisites, not proof of truth.
-- Do not backfill fact_verified_on from added_at, approval timestamps, or current_date.
ALTER TABLE trivia_squares.question_reserve
  ADD COLUMN IF NOT EXISTS fact_source_url text,
  ADD COLUMN IF NOT EXISTS fact_verified_on date;

CREATE OR REPLACE FUNCTION trivia_squares.publish_reviewed_questions(p_count integer DEFAULT 2)
RETURNS integer
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  rec trivia_squares.question_reserve%ROWTYPE;
  next_locale text;
  released integer := 0;
  max_count integer := least(greatest(coalesce(p_count, 2), 0), 5);
  candidate_city text;
  new_question_id bigint;
BEGIN
  FOR next_locale IN SELECT unnest(ARRAY['he','en','ru','fr','ar','es']::text[]) LOOP
    FOR rec IN
      SELECT * FROM trivia_squares.question_reserve
      WHERE locale = next_locale AND approved AND released_at IS NULL
      ORDER BY id LIMIT max_count FOR UPDATE SKIP LOCKED
    LOOP
      -- Fail closed: approval alone, or a URL in a free-text note, is insufficient.
      -- The verified_on date must have been explicitly supplied by the editorial workflow.
      IF rec.fact_source_url IS NULL
         OR rec.fact_source_url !~ '^https://[[:alnum:]][^[:space:]]+$'
         OR rec.fact_verified_on IS NULL
         OR rec.fact_verified_on > CURRENT_DATE THEN
        UPDATE trivia_squares.question_reserve SET approved = false WHERE id = rec.id;
        CONTINUE;
      END IF;

      -- Serialize identical text and Spanish city subjects across concurrent publishers.
      PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('trivia:question:' || rec.locale || ':' ||
          pg_catalog.lower(pg_catalog.btrim(rec.question)), 0)
      );
      IF rec.locale = 'es' AND rec.category ~* 'geografía' THEN
        candidate_city := trivia_squares.spanish_city_subject(rec.question);
        IF candidate_city IS NOT NULL THEN
          PERFORM pg_catalog.pg_advisory_xact_lock(
            pg_catalog.hashtextextended('trivia:es:city:' ||
              pg_catalog.lower(candidate_city), 0)
          );
          IF EXISTS (
            SELECT 1 FROM trivia_squares.questions existing
            WHERE existing.locale = 'es' AND existing.active
              AND existing.category ~* 'geografía'
              AND trivia_squares.spanish_city_subject(existing.question) = candidate_city
          ) THEN
            UPDATE trivia_squares.question_reserve SET approved = false WHERE id = rec.id;
            CONTINUE;
          END IF;
        END IF;
      END IF;

      new_question_id := NULL;
      INSERT INTO trivia_squares.questions
        (category, difficulty, question, answers, correct_index, locale, active)
      SELECT rec.category, rec.difficulty, rec.question, rec.answers,
             rec.correct_index, rec.locale, true
      WHERE NOT EXISTS (
        SELECT 1 FROM trivia_squares.questions existing
        WHERE existing.locale = rec.locale
          AND pg_catalog.lower(pg_catalog.btrim(existing.question))
              = pg_catalog.lower(pg_catalog.btrim(rec.question))
      )
      RETURNING id INTO new_question_id;

      IF new_question_id IS NOT NULL THEN
        -- Same transaction as the question: a provenance failure rolls back publication.
        INSERT INTO trivia_squares.question_provenance
          (question_id, locale, topic, source_key, source_url, verified_on)
        VALUES
          (new_question_id, rec.locale, rec.category,
           'reserve:' || rec.id::text, rec.fact_source_url, rec.fact_verified_on);
        UPDATE trivia_squares.question_reserve
        SET released_at = pg_catalog.now() WHERE id = rec.id;
        released := released + 1;
      ELSE
        UPDATE trivia_squares.question_reserve SET approved = false WHERE id = rec.id;
      END IF;
    END LOOP;
  END LOOP;
  RETURN released;
END;
$function$;

-- Do not call the publisher with a positive count in production during migration.
-- Historical released rows without provenance remain unchanged and require a separate audit.
