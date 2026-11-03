# Trivia Squares — project status (real state, evidence-based)

Last update: 2026-11-03, Claude (session https://claude.ai/code/session_01WbPQBLHLn4kBk7ma4Pe7j3).
Statuses: TODO · IN_PROGRESS · CODE_COMPLETE · TESTED · DEPLOYED · VERIFIED · BLOCKED. Only VERIFIED is done.

## Shipped
| Item | Status | Evidence |
|---|---|---|
| Language/Spanish questions could not be answered (Android bonus questions) — PR #88 | VERIFIED | Android E2E fails on 85b1467, passes after; passed on https://trivia-squares.vercel.app (2/2) |
| City-question runs for veteran players — PR #89 | VERIFIED | Veteran E2E fails on main (4 cities in a row), passes after; live run showed 1 city in 6 varied questions |
| Question variety: one geography question then a long run of other topics; suggest-a-question when only cities remain — PR #92 | VERIFIED | Unit + veteran E2E; deployed to production |
| In-game redesign: single layout owner, glass night-arcade look, photoreal art, settings tab, instant scroll on the game page — PR #93 | VERIFIED | CI 14/14 green; live 2026-11-02 at 390×844 (board 340px), 768×1024 (679px), 1366×768 (587px), 1920×1080 (876px): no horizontal scroll, no emoji, drag opens a question at every size |
| 200-stage server migration (`trivia_campaign_200_stages`) | VERIFIED | 200 rows, checks 1–200 / 0–200, both functions at 200, anon cannot execute, no progress rows touched |
| Scratch-off ticket + 96 fact-checked Hebrew questions in 9 new categories — PR #94 | DEPLOYED | Live: 18 topics incl. new ones, corrected texts in bundle. Scratch card covered by E2E; not yet hand-played on the live site |
| 200 stages in the client (40 chapters) — PR #95 | VERIFIED | Live: "שלב 1 / 200" at 390 and 1366, chapter navigation, stage 150 present |
| Server questions that contained their own answer | VERIFIED | 11 fixed + 36 retired on the server, 4 reserve rewritten; every old version kept in `trivia_squares.question_corrections`; full-containment re-scan: 1 left (a legitimate two-option comparison) |
| Answer-appeal server side (`trivia_answer_appeals` migration) | VERIFIED | Tables RLS-locked (anon/auth cannot select or insert); 4 SECURITY DEFINER RPCs executable by anon/auth only |
| Hourly review engine (scheduled task, runs at :19) | DEPLOYED | Created 2026-11-03; checks pending appeals with two independent sources, logs every change; stops immediately when the queue is empty |

## In review — branch `claude/launch-readiness`
| Item | Status | Notes |
|---|---|---|
| Appeal button after a wrong answer; guest reports reach review; approved appeal = line back + 25 credits; bundled-question corrections applied on device | TESTED | `e2e/answer-appeal.spec.ts`; fixtures never write to the live queue |
| 35 local questions that gave away their answer rewritten, 4 removed; `tests/answerLeak.test.mjs` blocks new ones | TESTED | Owner rule 2026-11-03 |
| No emoji in the UI (central display cleanup; artwork for stages, wallet, timer, welcome) | TESTED | DOM scan of every menu section and the question window: only ✕ and ✓ remain |
| Launch basics: self-hosted font, LCP preload, share image, robots, sitemap, service worker, manifest colours, 12px minimum text | TESTED | Lighthouse before: mobile 75/96/96/100, desktop 94/100/100/100 |
| Six languages: menu strings that showed Hebrew in ru/fr/ar/es | TESTED | DOM scan: 0 Hebrew strings outside Hebrew in all menus |
| Stage names in ru/fr/ar (200 each) | IN_PROGRESS | Hebrew, English and Spanish already exist |

## Decisions waiting for the owner
1. Publishing on Google Play: $25 developer fee, then a 12-tester × 14-day closed test (`docs/ANDROID_PLAY_RELEASE_HE.md`).
2. Monetisation model (doc "טריוויה ריבועים – הצעות מודל הכנסה"): recommended option C — free chapters 1–8, one-time unlock ₪29.90, no ads on Android.
3. Legal launch blockers in `docs/ISRAEL_LEGAL_COMPLIANCE_HE.md`: operator identity and contact address in the privacy policy, external legal review, minors policy.

## Open items (next)
1. Robot (computer opponent) still shows a fallback symbol — needs one Gemini image (owner's Chrome must be connected).
2. Images from free sources next to correct answers, with photographer credit — blocked: Wikimedia rate-limits this environment; needs the owner's Chrome.
3. Question bank: most server rows are one generated "which country/city" template; more verified non-geography content needed (no invented facts).
4. Older skins (urban, vintage, retro, pop, future) still carry legacy styling.
5. CSS debt: ~950 `!important` in legacy files.
6. Real-device checks (iPhone Safari, Android Chrome) for touch — Android sound confirmed by the owner; the rest emulated.

## Known blockers
- Merging to `main` requires the owner's approval; the owner approved merging Claude's PRs once the quality gate is green (2026-11-02).
