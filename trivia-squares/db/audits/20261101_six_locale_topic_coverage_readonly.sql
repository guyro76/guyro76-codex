-- Trivia Squares - read-only coverage audit for the exact topic classifier used by gameplay.
-- 2026-11-01. Scope: trivia_squares.questions, question_provenance,
-- and trivia_squares.question_mix_topic(category). NO DDL or data writes.
-- This reports inventory, not independent factual verification.
-- A provenance row/URL does NOT prove that a question is correct.
-- An empty topic bucket may reflect classifier labels, not an absence of
-- subject matter in every stored question. Review misclassified categories.
-- Never release unapproved reserve questions to fill these gaps.
--
-- Output 1: one row per locale with zero-filled topic coverage.
WITH locales(locale) AS (
 VALUES ('he'),('en'),('ru'),('fr'),('ar'),('es')
), topics(topic) AS (
 VALUES ('capitals'),('tv_film'),('music'),('eurovision'),('history'),
        ('science'),('nature'),('sports'),('israel_politics'),('food'),
        ('arts'),('aviation'),('cars'),('general')
), classified AS (
 SELECT q.locale,
        trivia_squares.question_mix_topic(q.category) AS topic,
        q.id,
        EXISTS (
          SELECT 1 FROM trivia_squares.question_provenance p
          WHERE p.question_id=q.id AND p.locale=q.locale
        ) AS has_provenance
 FROM trivia_squares.questions q
 WHERE q.active
), buckets AS (
 SELECT l.locale, t.topic,
        count(c.id)::int AS active_count,
        count(c.id) FILTER (WHERE c.has_provenance)::int AS provenance_count
 FROM locales l
 CROSS JOIN topics t
 LEFT JOIN classified c ON c.locale=l.locale AND c.topic=t.topic
 GROUP BY l.locale,t.topic
)
SELECT locale,
       sum(active_count) AS active_total,
       sum(active_count) FILTER (WHERE topic='capitals') AS capitals,
       sum(active_count) FILTER (WHERE topic<>'capitals') AS other_topics,
       sum(provenance_count) AS active_with_provenance,
       count(*) FILTER (WHERE active_count=0) AS empty_topic_buckets,
       string_agg(topic,', ' ORDER BY topic)
         FILTER (WHERE active_count=0) AS empty_topics
FROM buckets
GROUP BY locale
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],locale);

-- Output 2: detailed per-topic counts. The source flag is metadata only.
WITH locales(locale) AS (
 VALUES ('he'),('en'),('ru'),('fr'),('ar'),('es')
), topics(topic) AS (
 VALUES ('capitals'),('tv_film'),('music'),('eurovision'),('history'),
        ('science'),('nature'),('sports'),('israel_politics'),('food'),
        ('arts'),('aviation'),('cars'),('general')
), classified AS (
 SELECT q.locale,trivia_squares.question_mix_topic(q.category) AS topic,q.id,
        EXISTS (
          SELECT 1 FROM trivia_squares.question_provenance p
          WHERE p.question_id=q.id AND p.locale=q.locale
        ) AS has_provenance
 FROM trivia_squares.questions q WHERE q.active
)
SELECT l.locale,t.topic,count(c.id)::int AS active_questions,
       count(c.id) FILTER (WHERE c.has_provenance)::int AS with_provenance
FROM locales l CROSS JOIN topics t
LEFT JOIN classified c ON c.locale=l.locale AND c.topic=t.topic
GROUP BY l.locale,t.topic
ORDER BY array_position(ARRAY['he','en','ru','fr','ar','es'],l.locale),
         active_questions DESC,t.topic;

-- Interpret results together with db/audits/20261031_six_locale_inventory_readonly.sql.
-- No quota, approval or release gate is satisfied by this inventory audit.
