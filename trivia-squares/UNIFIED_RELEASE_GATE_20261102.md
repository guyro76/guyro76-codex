# Trivia Squares - Unified Release Candidate Gate
Date: 2026-11-02
Branch: release/trivia-unified-package-20261102
Source of truth: trivia-squares/ and GitHub issue #41 plus #77-#84, all outstanding Trivia Squares PRs and user requirements.

## Packaging rule
One deployable application under trivia-squares/. Keep modular source code, not one giant source file. Integrate approved work from branches only after reviewing conflicts and preserving user progress. No paid infrastructure or production deployment before verified QA.

## Required feature inventory
- Game engine: all four orthogonal drag directions, never diagonal, server-authoritative answer/move/reward accounting, no double claims, persisted player identity, scores, stage state, online multiplayer and bot.
- Question content: six complete locales HE/EN/RU/FR/AR/ES; language-specific validated content and native UI, diverse categories including Disney, Eurovision, culture, politics and 'How do you say?' with accurate transliteration; shuffle answers and question order each new game; no repeated questions per account; provenance and rights review. Do not equate 5,000 rows with 5,000 verified diverse questions.
- Premium UX: bold >=700 text everywhere, contrast AA, mobile/tablet/desktop, RTL/LTR, compact no-overflow board, glassmorphism and six visually distinct skins; palette picker on welcome and in-game; persistent preferences.
- Capture effects: bottom-up liquid INSIDE each claimed square, bubbles and sound, owner label after fill, fireworks and rewards; optional fish within claimed liquid squares only, toggle at any time, default off, reduced-motion and no gesture interception.
- Audio: gesture-unlocked WebAudio on real iOS, sounds for answers/capture/rewards/end, persistent mute and volume.
- Intermissions: wheel, word guessing, balloons, cake, sword/ninja, scratch, Simon-style three-round memory, computer-only tic-tac-toe, and optional paired-hidden-symbol recall every five levels; no penalty on skip; no duplicate rewards.
- Economy and progression: 100 levels, achievements, credits, bonus premium two-square closure, level-end podium, persistent scores and wallets, abuse protection, configurable 5-day pilot and disabled monetization until approval.
- Account and legal: Google/email login, profile persistence, age safeguards, privacy/accessibility/terms with verified operator details, Supabase RLS and RPC adversarial testing.

## Release checklist (all mandatory)
- [ ] Inventory all relevant open PRs and issues; merge or document disposition of each without losing changes.
- [ ] Implement and verify every feature above with test evidence, including new #77-#84.
- [ ] Check database migrations are safe and idempotent; never reset existing players.
- [ ] Run strict typecheck, build, gameplay unit tests, Playwright desktop/mobile, accessibility, six-language and six-skin matrix on ONE commit SHA.
- [ ] Real iPhone Safari audio/touch, Android Chrome and Samsung Internet touch/audio/landscape/RTL, tablet and desktop visual review.
- [ ] Real OAuth and multiplayer tests using two independent accounts, reconnect, failed answers, replay/duplicate attempts.
- [ ] Verify question-source audit, non-geography diversity, translation quality and actual counts.
- [ ] Verify privacy/security compliance, public domain and production environment configuration.
- [ ] Only then identify deployment blocker and ask owner to resolve; publish only after successful smoke test.

Status: TRACKING PACKAGE ONLY. This commit does not claim features implemented, QA passed or production readiness.
