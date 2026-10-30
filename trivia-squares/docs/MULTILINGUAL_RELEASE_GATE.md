# Trivia Squares - six-language release gate (live audit 2026-10-30)

## Scope and safety
Repository `guyro76/guyro76-codex`, app `trivia-squares`. Production Vercel project `prj_SmQQVjSCstHAxeHQdqLpAOnpcWBT`. Existing Supabase project `ueswnbbyxytvmjydvvwv`; access only `trivia_squares` data. No paid services, new projects, protection bypasses, or changes to unrelated services.

**This is a point-in-time audit, not release approval.** The hard requirement is **5,000 individually fact-verified, unique, active trivia questions in EACH of he, en, ru, fr, ar, es** (30,000 total), with four distinct answers and exactly one correct answer. Counts of active database records are NOT proof of factual verification.

## Database inventory (SQL read 2026-10-30)

| Locale | Active records | Inactive | Approved reserve not released | Released reserve |
|---|---:|---:|---:|---:|
| he | 5,525 | 395 | 47 | 5 |
| en | 5,553 | 324 | 51 | 5 |
| ru | 5,408 | 0 | 0 | 0 |
| fr | 5,410 | 0 | 0 | 0 |
| ar | 5,407 | 0 | 0 | 0 |
| es | 8,528 | 2,089 | 0 | 0 |
| **Total** | **35,831** | **2,808** | **98** | **10** |

- All 35,831 active rows passed **structural** SQL checks: four nonempty, distinct options; answer index 0-3; question length >=10. This does **not** validate factual correctness, translation or source provenance.
- No exact active duplicate question text groups (per locale, case/trim normalized); **semantic paraphrase duplicates are not ruled out**.
- No active math-category rows were found by the checked category patterns. A full question-text/content audit is still required.
- `trivia_squares.questions` does **not** have a per-question `source_note` column. It is therefore not possible to certify 5,000 independently sourced active questions per locale from these counts. Existing `question_reserve.source_note` is not evidence for the entire active bank.
- The geography category alone accounts for over 5,000 questions in each language. Diverse subject distribution and per-stage topic rotation must be validated against actual player sessions.
- `trivia_squares.seen_questions` has **0 rows** at this snapshot. That does not prove a broken mechanism (no signed-in usage may have occurred), but does not demonstrate 30-stage no-repeat history either.
- RLS enabled on `questions`, `question_reserve`, `seen_questions`. `seen_questions` has a user-scoped SELECT policy; writes are through authenticated, checked SECURITY DEFINER public trivia RPCs. Do not disable RLS.
- `trivia_squares.publish_reviewed_questions` limits releases to at most five per locale per call. With zero reserve in ru/fr/ar/es, no new verified inventory is available there. Do not seed unverified filler.
- Reserve top-up threshold is 35: **ru/fr/ar/es require at least 30 independently verified new questions each**, imported only after source and answer review. Keep each batch small and auditable.

Read-only repeatable inventory:
```sql
SELECT locale, count(*) FILTER (WHERE active) AS active,
       count(*) FILTER (WHERE NOT active) AS inactive
FROM trivia_squares.questions GROUP BY locale ORDER BY locale;

SELECT locale,
       count(*) FILTER (WHERE approved AND released_at IS NULL) AS approved_unreleased,
       count(*) FILTER (WHERE approved AND released_at IS NOT NULL) AS released
FROM trivia_squares.question_reserve GROUP BY locale ORDER BY locale;

SELECT count(*) FROM trivia_squares.seen_questions;
```

## Deployment and QA (2026-10-30)

- Production alias `trivia-squares.vercel.app` resolves in Vercel to deployment `dpl_GdF3LNeJNGPEFAb1ZUTrFN87LGcq`, state `READY`, SHA `360d42b529fcb079475c32c68318c2049f2a486c`, target `production`.
- GitHub comparison confirms this SHA is one commit ahead of `fe34be0e11599fcbe61e49d69e270fdb510546d6`, and at the time of audit equals `main`.
- The GitHub combined commit statuses only report successful Vercel contexts. **No GitHub Actions test runs were returned for this SHA or the PR head**, so do not call CI green or E2E passed.
- Authenticated Vercel URL fetch failed with 403 at protection-bypass API. Do not claim a successful public browser test; do not turn off deployment protection to make the check pass.
- The PR contains a 12-check locale matrix (2 checks for each of 6 locales) configured for desktop and mobile Chromium. This is a **test definition**, not proof that 24 browser executions passed, and is not 12 AI agents.
- Main contains additional Playwright game tests for marker drawing, state persistence, legal routes and account controls. Their presence does not establish pass status.
- Before release: run full automated CI and E2E on actual connected Supabase, browser QA for desktop/tablet/phone including iPhone Safari and Android Chrome, verify layout switcher, no nested scrolling, bold/contrast/glass UI, board stability after answer, persistence, six skins (including pop and orange-violet future), palette button, RTL/LTR, all translations, footer, premium/double rewards, two-adjacent-square/last-square rule, marker stroke and score, wheel and word intermissions, topic rotation, auth/RLS, global no-repeat history after stage 30, and a factual audit of the bank.
- **Release gate remains BLOCKED** until factual verification per locale and passing connected E2E/CI are evidenced. READY is a deployment/build state only.

## Change-control rule
Do not deploy merely to satisfy the audit. Changes to content must be verified before insertion; changes to code require green CI and connected E2E. Do not touch unrelated schemas or services.
