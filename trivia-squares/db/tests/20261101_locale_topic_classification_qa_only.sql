-- QA-only after applying 20261101_locale_topic_classification.sql in an isolated database.
-- READ-ONLY assertions: no table changes, no player/session access.
-- Never execute this against production before the migration is separately approved.
DO $qa$
DECLARE failed text;
BEGIN
 SELECT string_agg(locale || ': ' || category || ' expected ' || expected || ' got ' || actual, E'\n')
 INTO failed
 FROM (
   SELECT locale,category,expected,trivia_squares.question_mix_topic(category) actual
   FROM (VALUES
     ('en','Krovim Krovim · Israeli TV','tv_film'),
     ('ar','التكنولوجيا','science'),
     ('fr','Gastronomie','food'),
     ('he','גאוגרפיה','capitals'),
     ('en','World capitals','capitals'),
     ('ru','Евровидение','eurovision'),
     ('es','Películas Disney','tv_film'),
     ('ar','أفلام ديزني','tv_film'),
     ('fr','Cinéma · films Disney','tv_film'),
     ('he','מוזיקה ישראלית','music'),
     ('en','History','history'),
     ('es','Música actual','music'),
     ('fr','Géographie','capitals'),
     ('ru','Наука','science'),
     ('ar','الرياضة','sports')
   ) AS checks(locale,category,expected)
 ) result WHERE actual IS DISTINCT FROM expected;
 IF failed IS NOT NULL THEN
   RAISE EXCEPTION 'trivia_squares.question_mix_topic classification regression: %',failed;
 END IF;
END
$qa$;

-- Expected after migration: all three targeted rows have mismatch_count=0.
WITH expected(locale,category,topic) AS (
 VALUES ('en','Krovim Krovim · Israeli TV','tv_film'),
        ('ar','التكنولوجيا','science'),
        ('fr','Gastronomie','food')
)
SELECT e.locale,e.category,e.topic expected_topic,
 count(q.id) FILTER (WHERE q.active) active_questions,
 count(q.id) FILTER (WHERE q.active
   AND trivia_squares.question_mix_topic(q.category)<>e.topic) mismatch_count
FROM expected e LEFT JOIN trivia_squares.questions q
 ON q.locale=e.locale AND q.category=e.category
GROUP BY e.locale,e.category,e.topic
ORDER BY e.locale;
