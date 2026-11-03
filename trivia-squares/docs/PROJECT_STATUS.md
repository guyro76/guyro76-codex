# Trivia Squares — project status (real state, evidence-based)

Last update: 2026-11-03 (night), Claude (session https://claude.ai/code/session_01WbPQBLHLn4kBk7ma4Pe7j3).
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

## Shipped 2026-11-03 (continued)
| Item | Status | Evidence |
|---|---|---|
| Appeals + hourly review engine, no-leak rule, no emoji, launch basics, six-language fixes — PR #100 | VERIFIED | Live files/tags checked; Lighthouse mobile 78/100/100/100, desktop 99/100/100/100 |
| Mini-games open in view, next-stage button, unique premium card per stage — PR #101 | VERIFIED | Live iPhone emulation: wheel → prize → next stage |
| Photos next to correct answers with photographer credit (12 Wikimedia images) — PR #102 | DEPLOYED | E2E verified; not yet hand-checked on a real phone |
| Question quality: 87 trivial Hebrew questions replaced (+50 server rows) — PR #103 | VERIFIED | Independent review with sources; leak test green |
| Security: answer index no longer sent to the browser (server-side check) — PR #103 + server stage 2 | VERIFIED | REST shows no `correct` in batches; live play scores correctly |
| Ultra QA (independent, live site) | VERIFIED | Verdict "ready with fixes"; all high/medium findings fixed, low items listed below |

## Decisions waiting for the owner
1. Publishing on Google Play: $25 developer fee, then a 12-tester × 14-day closed test (`docs/ANDROID_PLAY_RELEASE_HE.md`).
2. Monetisation model (doc "טריוויה ריבועים – הצעות מודל הכנסה"): recommended option C — free chapters 1–8, one-time unlock ₪29.90, no ads on Android.
3. Legal launch blockers in `docs/ISRAEL_LEGAL_COMPLIANCE_HE.md`: operator identity and contact address in the privacy policy, external legal review, minors policy.

## Open items (next)
1. Robot (computer opponent) still shows a fallback symbol — needs one Gemini image (owner's Chrome must be connected).
2a. Ultra QA low items left: duplicate question pairs across banks (Central Perk, Simba's father, Weizmann, Morocco 1980…), time-sensitive questions without an expiry, mobile LCP 3.8s (main JS bundle), Arabic chapter nav wraps at 390px, dev-only settings (device preview) visible.
3. Question bank: most server rows are one generated "which country/city" template; more verified non-geography content needed (no invented facts).
4. Older skins (urban, vintage, retro, pop, future) still carry legacy styling.
5. CSS debt: ~950 `!important` in legacy files.
6. Real-device checks (iPhone Safari, Android Chrome) for touch — Android sound confirmed by the owner; the rest emulated.

## Known blockers
- Merging to `main` requires the owner's approval; the owner approved merging Claude's PRs once the quality gate is green (2026-11-02).
