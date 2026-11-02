# Trivia Squares — project status (real state, evidence-based)

Last update: 2026-11-02, Claude (session https://claude.ai/code/session_01WbPQBLHLn4kBk7ma4Pe7j3).
Statuses: TODO · IN_PROGRESS · CODE_COMPLETE · TESTED · DEPLOYED · VERIFIED · BLOCKED. Only VERIFIED is done.

## Shipped this session
| Item | Status | Evidence |
|---|---|---|
| Language/Spanish questions could not be answered (Android bonus questions) — PR #88 | VERIFIED | Android E2E fails on 85b1467, passes after; passed on https://trivia-squares.vercel.app (2/2) |
| City-question runs for veteran players — PR #89 | VERIFIED | Veteran E2E fails on main (4 cities in a row), passes after; live run showed 1 city in 6 varied questions |

## In progress — branch `claude/trivia-game-layout`
| Item | Status | Notes |
|---|---|---|
| P0 game screen layout (board first, single layout owner `game-layout.css`) | TESTED (local) | Board fully visible at 390×844 … 1920×1080, no horizontal scroll (`e2e/board-viewports.spec.ts`) |
| Secondary controls moved to menu → Settings tab (language, volume, sound test, fill demo, fish, device preview, clock/weather) | TESTED (local) | Nothing removed |
| Night Arcade Glass design + Apple-style refinement (`game-visual.css`), Rubik font | CODE_COMPLETE | Owner feedback: Apple-like frosted glass, soft shadows, elegant buttons |
| Photorealistic artwork replacing emoji (worlds, wallet, stage flag, trophy, 9 avatars incl. new owl) | CODE_COMPLETE | Gemini image (owner's Google AI Plus, no extra cost), cut out to `public/art/*.webp` |
| Welcome screen redesign matching the game | CODE_COMPLETE | |
| Board SVG: glossy dots, candy-tube lines, tinted glass cells, no emoji in empty cells | CODE_COMPLETE | |

## Open items (next)
1. Robot (computer opponent) and the 100 stage icons still use emoji — one more Gemini sheet.
2. Remaining UI glyphs (sound, palette, play, help, marker, versus) are clean vector glyphs, not photos — confirm with owner.
3. Question bank: Hebrew has ~550 varied questions; 5,250 of ~5,550 server rows are one generated "which country/city" template. Needs verified non-geography content (no invented facts).
4. Older skins (urban, vintage, retro, pop, future) still carry legacy styling; only the default skin got the new design.
5. CSS debt: ~950 `!important` in legacy files. Layout is now owned by `game-layout.css`; colour rules still overlap.
6. Real-device checks (iPhone Safari, Android Chrome) for audio and touch — only emulated so far.

## Known blockers
- Merging to `main` requires the owner's explicit approval in chat (safety gate on merge-without-review).
