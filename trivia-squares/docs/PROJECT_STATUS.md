# Trivia Squares — project status (real state, evidence-based)

Last update: 2026-11-02, Claude (session https://claude.ai/code/session_01WbPQBLHLn4kBk7ma4Pe7j3).
Statuses: TODO · IN_PROGRESS · CODE_COMPLETE · TESTED · DEPLOYED · VERIFIED · BLOCKED. Only VERIFIED is done.

## Shipped this session
| Item | Status | Evidence |
|---|---|---|
| Language/Spanish questions could not be answered (Android bonus questions) — PR #88 | VERIFIED | Android E2E fails on 85b1467, passes after; passed on https://trivia-squares.vercel.app (2/2) |
| City-question runs for veteran players — PR #89 | VERIFIED | Veteran E2E fails on main (4 cities in a row), passes after; live run showed 1 city in 6 varied questions |

| Question variety: one geography question then a long run of other topics; suggest-a-question when only cities remain — PR #92 | VERIFIED | Unit + veteran E2E; deployed to production |
| In-game redesign: single layout owner, glass night-arcade look, photoreal art, settings tab, instant scroll on the game page — PR #93 | VERIFIED | CI 14/14 green; live 2026-11-02 at 390×844 (board 340px), 768×1024 (679px), 1366×768 (587px), 1920×1080 (876px): no horizontal scroll, no emoji, 15 art images, drag opens a question at every size |
| 200-stage server migration (`trivia_campaign_200_stages`) | VERIFIED | 200 rows, checks 1–200 / 0–200, both functions at 200, anon cannot execute, no progress rows touched |

## In review
| Item | Status | Notes |
|---|---|---|
| Scratch-off ticket + 96 fact-checked Hebrew questions in 9 new categories — PR #94 | DEPLOYED | Live: 18 topics incl. new ones, corrected texts in bundle. Scratch card covered by E2E; not yet hand-played on the live site |
| 200 stages in the client (40 chapters, unique names in he/en/es) | TESTED (local) | Server side already migrated |

## Open items (next)
1. Robot (computer opponent) and the stage icons still use emoji — one more Gemini sheet.
2. Remaining UI glyphs (sound, palette, play, help, marker, versus) are clean vector glyphs, not photos — confirm with owner.
3. Question bank: Hebrew has ~650 varied questions (incl. 96 curated); 5,250 of ~5,550 server rows are one generated "which country/city" template. Needs verified non-geography content (no invented facts).
4. Older skins (urban, vintage, retro, pop, future) still carry legacy styling; only the default skin got the new design.
5. CSS debt: ~950 `!important` in legacy files. Layout is now owned by `game-layout.css`; colour rules still overlap.
6. Real-device checks (iPhone Safari, Android Chrome) for touch — Android sound confirmed by the owner; the rest emulated.
7. Images from free sources (Wikimedia Commons) next to correct answers, with photographer credit — TODO.

## Known blockers
- Merging to `main` requires the owner's approval; the owner approved merging Claude's PRs once the quality gate is green (2026-11-02).
