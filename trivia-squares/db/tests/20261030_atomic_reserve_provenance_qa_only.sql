-- Run only on an isolated QA database AFTER 20261030_atomic_reserve_provenance.sql.
-- Transaction rollback protects question/reserve/provenance rows. Never use this as factual validation.
BEGIN;
DO $qa$
DECLARE
  label text := 'QA-only reserve provenance ' || pg_catalog.txid_current()::text;
  new_id bigint;
  inserted_count integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM trivia_squares.question_reserve
    WHERE approved AND released_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Refusing test while real approved reserve rows exist';
  END IF;

  -- Missing explicit editorial evidence must fail closed.
  INSERT INTO trivia_squares.question_reserve
    (locale, category, difficulty, question, answers, correct_index,
     approved, source_note)
  VALUES
    ('en','QA-only',1,label || ' missing',
     '["A","B","C","D"]'::jsonb,0,true,'https://example.org/qa')
  RETURNING id INTO new_id;
  inserted_count := trivia_squares.publish_reviewed_questions(1);
  IF inserted_count <> 0 OR
     (SELECT approved FROM trivia_squares.question_reserve WHERE id = new_id) THEN
    RAISE EXCEPTION 'Missing editorial verification was published';
  END IF;

  -- Explicit metadata is written atomically with a newly published question.
  INSERT INTO trivia_squares.question_reserve
    (locale, category, difficulty, question, answers, correct_index,
     approved, source_note, fact_source_url, fact_verified_on)
  VALUES
    ('en','QA-only',1,label,
     '["A","B","C","D"]'::jsonb,0,true,
     'QA-only synthetic fixture, not an editorial verification',
     'https://example.org/qa',CURRENT_DATE);
  inserted_count := trivia_squares.publish_reviewed_questions(1);
  IF inserted_count <> 1 OR NOT EXISTS (
    SELECT 1 FROM trivia_squares.questions q
    JOIN trivia_squares.question_provenance p ON p.question_id=q.id
    WHERE q.locale='en' AND q.question=label
      AND p.locale='en' AND p.topic='QA-only'
      AND p.source_url='https://example.org/qa'
      AND p.verified_on=CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Atomic question + provenance publication failed';
  END IF;

  -- The reserve table has UNIQUE(locale, question), so a second INSERT
  -- of the same question would fail before reaching the publisher.
  -- Re-queue the QA-only reserve row inside this rolled-back transaction
  -- to verify the publisher rejects an already-live question.
  SELECT id INTO new_id
  FROM trivia_squares.question_reserve
  WHERE locale='en' AND question=label AND released_at IS NOT NULL;
  IF new_id IS NULL THEN
    RAISE EXCEPTION 'QA reserve row was not released';
  END IF;
  UPDATE trivia_squares.question_reserve
  SET approved=true, released_at=NULL
  WHERE id=new_id;
  inserted_count := trivia_squares.publish_reviewed_questions(1);
  IF inserted_count <> 0 OR
     (SELECT approved FROM trivia_squares.question_reserve WHERE id=new_id) OR
     (SELECT count(*) FROM trivia_squares.questions
      WHERE locale='en' AND question=label) <> 1 THEN
    RAISE EXCEPTION 'Duplicate reserve publication was not blocked';
  END IF;
END;
$qa$;
ROLLBACK;
-- example.org is deliberately a test-only placeholder, never an approved fact source.
