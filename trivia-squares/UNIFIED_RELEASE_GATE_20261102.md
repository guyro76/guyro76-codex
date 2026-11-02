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

## Requirement reconciliation (user conversations + issue tracker, 2026-11-02)
This is a **coverage inventory, not a claim that code or QA is complete**. Every item must be checked against the unified branch and verified with reproducible evidence before release.

| Scope | Explicit acceptance requirement | Tracking |
|---|---|---|
| Core board | Four cardinal drawing directions; no diagonal; one question per valid edge; correct turn/owner/score; no frozen answers | #41 |
| Identity | Persist real name, login and progress across iPhone, Android, desktop, reload; no reversed Hebrew name or phantom player | #41 |
| Questions | At least 5,000 genuinely verified unique questions **per each of six languages**; diverse topics per stage; no repeated Canberra opener; shuffle both question and answers; no premature exhaustion | #41 |
| Topics | Disney films, TV (Friends, Grey's Anatomy, Days of Our Lives, Israeli shows), Eurovision, Israeli politics, cars, airlines, sports, music, history, capitals, leaders, Fast & Furious, and language translations | #41 #84 |
| Language learning | Native spelling and readable phonetics, accurate target language, plausible unambiguous choices, pronunciation aid, multilingual QA | #84 |
| Language UI | HE/EN/RU/FR/AR/ES fully translated; correct RTL/LTR; no mixed-language questions/answers/buttons | #41 #83 |
| Rewards | +10 knowledge points and +5 credits per correct answer; +10 credits for captured square; stage rewards; prevent duplicate credit; persisted wallet | #41 |
| Bonus | Premium question, bonus question, double reward and up to two squares where valid; sensible last-square behavior | #41 |
| Campaign | 100 stages, varied stage content, stages 7/9 recovery, unlocked progress, achievements, podium and gifts | #41 |
| Intermissions | Wheel, scratch, hangman/word guessing, ninja sword, scissors, cake, balloons, Simon-like three-round sequence, AI-only tic-tac-toe, optional pair-memory challenge every five stages; skip without penalty | #41 #77 #78 #79 |
| Captures | Individual-square bottom-up liquid, name/avatar after fill, sparkle/fireworks and sound, no touch interception; optional fish default off with in-game toggle | #80 #81 |
| Combo | Streaks 3/5/10 with meaningful sound, visible progress, reset on new stage and wrong answer; multiplayer fairness | #80 |
| Audio | Original WebAudio cues for correct/wrong/draw/coin/star/capture/liquid/fireworks/bonus/level/combos; volume/mute persists; tap unlock; foreground recovery; iOS Safari and Android Chrome/Samsung Internet actual-device test | #41 #80 |
| Appearance | Six distinct skins regular/urban/vintage/retro/pop/future; palette on welcome and in-game; bold >=700, accessible contrast, premium colorful glassmorphism | #80 #82 #83 |
| Responsive | iPhone Safari, Android Chrome/Samsung Internet, portrait/landscape tablets and wide desktop; compact board, no clipping/long forced scroll; viewport preview | #41 |
| Multiplayer | Solo, computer, friend/random and up to four participants as supported by backend; real two-account session testing and fair rewards | #41 |
| UX extras | Daily/weekly missions, treasure chests, stage world map, boss levels, surprise golden squares, avatar, friend league, achievement cabinet, question fact/translation and return-to-game screen | Feature inventory: implementation/QA unverified |
| Contributions | Player-submitted questions, verification and meaningful reward, no unverified publication | #41 |
| Monetization | Five-day pilot; lite ads and lifetime full purchase are **future decisions**, disabled until owner approves | #41 |
| Compliance | Privacy/terms/age/accessibility, Google/email auth, Supabase RLS and abuse tests, no fabricated operator details | #41 |
| Production | Typecheck, build, unit tests, Playwright device/locale/skin matrix, real audio and account tests, one-SHA CI, deployment smoke test | #41 |

**Release blocker policy:** An unchecked row cannot be described as implemented merely because it appears here. Mark status with commit, test run and actual device evidence. Avoid resetting existing players or introducing paid services.

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
