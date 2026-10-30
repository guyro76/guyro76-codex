# Trivia Squares | Family release QA, 30 October 2026

This audit is based on actual previous user requests, not on an invented feature list. Run it against the **main** code and deployed production, not stale PR #34. Never delete or reset player data; avoid payment and chargeable services.

Production: https://trivia-squares.vercel.app/
Supabase: existing `social-hub` project, isolated `trivia_squares` schema.
Pre-existing saves, especially Adi's level 9, must survive.

## 10 independent QA scopes
1. **Dots & Boxes:** swipe/drag from any two adjacent dots, reject tapping/diagonals; each attempted line triggers a four-choice trivia question; wrong answer does not claim edge or award points. Automated: `e2e/game.spec.ts`, unit tests.
2. **Captures:** square ownership, Hebrew nickname order on iPhone, marker strokes, rising liquid, bubbles, wave, sparkles, high-contrast name plate, reduced-motion. Automated: `e2e/capture.spec.ts`, `e2e/premium.spec.ts`.
3. **Stages:** 100 contiguous stages, 20 chapter groups of 5; never overwrite levels 1-30 or clear an existing level-9 save. Automated: `e2e/game.spec.ts`, `tests/campaignStages.test.mjs`.
4. **Four between-stage games:** wheel, word, balloon, cake; automatically visible after each completed stage, can skip; one verified award per stage, persists across reload. Automated: `e2e/stage-intermissions.spec.ts`, `e2e/intermission-mini-games.spec.ts`.
5. **Credits and bonus:** credits gained for captures and intermissions; wallet immediately visible, saved across refresh; gold question after a streak, fair neighboring premium closure, no extra final-square theft. Automated: `e2e/premium.spec.ts` and family smoke test.
6. **Content quality:** six independent language pools with >=5,000 active each; topic variety even when geography dominates raw pool; Disney, film, TV, Israeli politics, Eurovision, music, science; no malformed or duplicate answers. Database QA + `tests/questionMix.test.mjs` and language content gate.
7. **Localization:** Hebrew, English, French, Russian, Arabic, Spanish; all controls, rewards, on-boarding, RTL/LTR, Android/iOS installation labels. Automated: 12 locale-specific CI lanes plus `e2e/i18n.spec.ts`, `e2e/multilingual-matrix.spec.ts`.
8. **Experience:** six selectable skins, memorable identity and glass design, bold high-contrast readable typography, no horizontal scroll or clipped board, 768x1024 tablet board, desktop and phone layouts. Automated: `e2e/compact-layout.spec.ts`, `e2e/accessibility.spec.ts`.
9. **Platforms:** iPhone Safari and Android Chrome PWA icons 180/192/512, consistent Hebrew app name, touch input and sounds after gesture, reload persistence. Automated: `e2e/android-ios-install.spec.ts`; must also be checked with actual family hardware, which simulated Chromium does not replace.
10. **Infrastructure/safety:** production alias points to current main SHA; Supabase Auth, private player data and RLS, legal pages, secure RPCs, question proposals and reward anti-abuse, 5-day free family evaluation without billing/ads. Automated: quality gate, `e2e/community.spec.ts`, `e2e/accessibility.spec.ts`, backend read-only audit and deployment metadata inspection.

## Release gates
- GitHub TypeScript check, unit tests, production build and E2E must all pass on the candidate SHA.
- 12 visual/gameplay jobs across six languages must pass on the same SHA.
- Vercel production READY must report that SHA on branch main and stable public alias.
- Android and iOS real-device tests are not implicitly proven by Chromium emulation.
- A QA failure is **not** permission to relax tests or erase progress. Correct the cause and rerun.
- Do not imply verified 5,000 high-quality unique cross-topic questions merely from raw volume: geography balance needs editorial monitoring.
