# Trivia Squares | live Supabase QA | 2026-10-30

Production database: existing `social-hub` project, isolated schema `trivia_squares`. No new project, branch, paid service or billing integration was created.

## Verified facts
- Before duplicate deactivation: 38,615 total records, 37,968 active.
- Found 341 pairs with identical Spanish question text (`locale + question`), though some answer choices differed.
- Applied Supabase migration `trivia_deduplicate_active_questions_and_guard_reimports`.
- Only the later duplicate copies were changed to `active = false`; no questions were deleted. The earlier IDs remain untouched.
- Created partial unique index `trivia_questions_active_locale_question_uniq` on `(locale, question) WHERE active IS TRUE`.
- After change: **37,627 active records and zero duplicated active (`locale, question`) pairs**.
- Active counts: `he 5578`, `en 5548`, `ru 5408`, `fr 5410`, `ar 5407`, `es 10276`. Spanish is in the database but not enabled as a sixth client UI language.
- Four-answer structure, valid correct-answer index, distinct answer text and non-empty options were checked with SQL for all active rows. This is structural QA **not** factual validation of every answer.

## Repeatable QA SQL

```sql
SELECT locale, count(*) AS active_questions,
       count(DISTINCT question) AS distinct_active_questions
FROM trivia_squares.questions
WHERE active IS TRUE
GROUP BY locale ORDER BY locale;

SELECT count(*) AS duplicate_active_groups
FROM (
  SELECT locale, question FROM trivia_squares.questions
  WHERE active IS TRUE GROUP BY locale, question HAVING count(*) > 1
) duplicates;

SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'trivia_squares'
  AND indexname = 'trivia_questions_active_locale_question_uniq';
```

## Content and launch warnings
- About 5,250 geography questions per supported locale mean raw record count is **not** the same as varied content. Keep the category-balancing logic and continue editor-reviewed popular culture, cinema, Disney, sports, science and Israeli current affairs.
- The 5,000-per-language target is met in the active database but questions require factual, linguistic and category-specific sampling. Displaying all 5,000 in a session is **not** a requirement.
- The deployed Vercel app is `READY`, but deployment protection is still enabled; do not call it a public launch.
- Two-account online E2E, genuine OAuth, iOS Safari, legal operator contact and accessibility sign-off remain release gates.
- Payments are disabled. Explore five-day free access and Lite ads/full paid/lifetime models only after testing; no charge without explicit owner approval.
