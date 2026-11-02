# Trivia Squares — QA matrix

Evidence only. Each row says what was run, where, and the result. "Static" means code reading, not a run.

## Cycle 1 — game screen layout (branch `claude/trivia-game-layout`, 2026-11-02)

### Board geometry, local production build (`next build && next start`), headless Chrome, Hebrew, game screen after tutorial
Board rect = `svg.board` bounding box [x, y, width, height] in CSS px.

| Viewport | Before (main 85b1467) | After | Board fully on screen | Horizontal scroll |
|---|---|---|---|---|
| 390×844 | board ~3 screens below the top (clock, weather, test buttons, language bar, campaign strip above it) | [29, 319, 332, 332] | yes | no |
| 430×932 | same as above | [29, 319, 372, 372] | yes | no |
| 768×1024 | legacy rule `calc(100dvh - 685px)` capped board at ~339 px | [49, 301, 671, 671] | yes | no |
| 1024×768 | board below the fold | [402, 112, 581, 581] | yes | no |
| 1366×768 | legacy rule clamped board to 270–310 px | [739, 125, 579, 579] | yes | no |
| 1440×900 | board below the fold | [681, 125, 710, 710] | yes | no |
| 1920×1080 | board below the fold | [783, 125, 868, 868] | yes | no |

### Interaction, local production build
| Check | 390×844 touch (CDP touch events) | 1366×768 mouse |
|---|---|---|
| Drag dot → adjacent dot opens one question | PASS | PASS |
| Question card answers in a 2×2 grid (1 column ≤520 px) | PASS (visual) | PASS (visual) |
| Menu → Settings tab shows language, volume, sound test, fill demo, fish, device preview, clock/weather | — | PASS (visual) |

### Automated suites
| Suite | Baseline main 85b1467 | After cycle 1 |
|---|---|---|
| TypeScript `tsc --noEmit` | PASS | PASS |
| Unit `node --test tests/*.test.mjs` | 115/115 | see PROJECT_STATUS |
| E2E Playwright (desktop + mobile projects) | 162 passed, 5 failed, 11 skipped | see PROJECT_STATUS |

Baseline E2E failures that existed before cycle 1 (not caused by it):
1. desktop-live-gameplay — live wide desktop layout
2. game.spec:181 — each subsequent question is new
3. game.spec:223 — new game never repeats a displayed question
4. game.spec:281 — dragging keeps marker path responsive
5. game.spec:405 — wrong answer reveals the correct option until Continue

### Not verifiable from the cloud container
- Audible sound on a real iPhone/Android (only Web Audio scheduling can be asserted headlessly).
- Real iOS Safari / Android Chrome rendering (Chromium emulation only).
