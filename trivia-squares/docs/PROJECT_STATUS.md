# Trivia Squares — project status (real state, evidence-based)

Last update: 2026-11-08, Claude (session https://claude.ai/code/session_01WbPQBLHLn4kBk7ma4Pe7j3).
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
| Robot artwork for the computer opponent (Gemini, transparent WebP) — PR #105 | DEPLOYED | Live: /art/robot.webp 384px, mapping in the production bundle; bot mode needs a signed-in account, so not hand-played |
| Ultra QA low items: 16 duplicate questions no longer dealt, device preview behind ?devtools=1, menu subtitle in 6 languages — PR #106 | VERIFIED | CI 14/14; live: preview hidden by default and shown with ?devtools=1, Arabic menu title translated, duplicate list in production bundle |
| Faster first screen: welcome screen in the server HTML, game loads as its own chunk; returning players skip the welcome before first paint — PR #108 | VERIFIED | Home first-load JS 358 → 115 kB; live Lighthouse mobile perf 0.86–0.93 (was 0.78–0.80), LCP 1.8–2.4 s (was 3.8 s), a11y/BP/SEO 1.0, desktop perf 1.0; live at 390/768/1366/1920: welcome → board, board 340/679/587/876 px, no horizontal scroll, no page errors, returning players see no welcome flash; full E2E 182/182 locally, CI 14/14 |
| 105 new Hebrew questions (13 topics), each checked by an independent reviewer against two sources; runtime guard never deals a question that names one of its options — PR #110 | DEPLOYED | CI 14/14, unit 133/133; live bundle contains the new questions; guard removes 3 bundled items, server row 1514 retired with audit entry. Sources: docs/CURATED_QUESTIONS_QA_HE.md |
| Random mini-game opens by itself before every next stage (no choice list; never the same twice in a row; in view on phones) — PR #112 | VERIFIED | Live iPhone 13: 4 runs drew scratch/pairs/word/wheel, game label at y=100 (was y=939, below the screen), no choice list, no errors; wheel played → prize → stage 2. CI 14/14; new E2E opens all 11 games in view |
| Polish round 1: one-pill wallet, short hint after stage 3, type hierarchy (>=700), Android vibration with a switch, difficulty ramp + difficulty in the question, learn-more source link — PR #114 | VERIFIED | Full E2E 206/206 locally, CI 14/14; live 390/768/1366/1920: board 340/679/587/876, no horizontal scroll, no errors |
| Topic lines: only 2 (3x3) or 3 (bigger boards) lines carry a topic; drawing one deals a question of that topic; chain bonus (+15 double line, +5/+10 on streaks) — PR #115 | VERIFIED | E2E checks the dealt question's topic; live: 2 topic lines + legend at all four sizes |
| Quick start (welcome → board, no forced tutorial, solo needs no name until after stage 1), personal statistics, daily challenge with server leaderboard — PR #116 + migration `trivia_daily_challenge` | VERIFIED | Live first visit: no tutorial, no name gate, dots playable. /daily: 10 distinct questions played on a phone, result shown, empty-board message (live table not written by tests). Table RLS-locked (anon cannot select/insert), RPCs executable by anon/auth only |
| Daily page hydration error (date rendered at build time) — PR #117 | DEPLOYED | Local: no page errors after the fix; E2E 2/2 |

## Decisions waiting for the owner
1. Publishing on Google Play: $25 developer fee, then a 12-tester × 14-day closed test (`docs/ANDROID_PLAY_RELEASE_HE.md`).
2. Monetisation model (doc "טריוויה ריבועים – הצעות מודל הכנסה"): recommended option C — free chapters 1–8, one-time unlock ₪29.90, no ads on Android.
3. Legal launch blockers in `docs/ISRAEL_LEGAL_COMPLIANCE_HE.md`: operator identity and contact address in the privacy policy, external legal review, minors policy.

## Open items (next)
1. Game chunk is 184 kB gzip (all six question banks inside). Splitting banks per locale would save roughly 25 kB gzip for Hebrew players; low priority after #108.
2. Checked and closed: Arabic chapter navigation fits one row at 390px; time-sensitive questions are all date-anchored ("until 2026", "October 2026 chart"), so they stay true.
3. Question bank: server rows are still mostly the "which country/city" template; Hebrew now has 201 curated verified questions. Next: the same for the other five languages.
4. Older skins (urban, vintage, retro, pop, future) still carry legacy styling.
5. CSS debt: ~950 `!important` in legacy files.
6. Real-device checks (iPhone Safari, Android Chrome) for touch — Android sound confirmed by the owner; the rest emulated.

## Known blockers
- Merging to `main` requires the owner's approval; the owner approved merging Claude's PRs once the quality gate is green (2026-11-02).
