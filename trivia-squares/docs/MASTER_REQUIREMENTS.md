# Trivia Squares — consolidated requirements

Source of truth: the owner's "CLAUDE MASTER CONTROL PROMPT" (2026-11-02), plus `README.md`, `CODEX_TASK.md`, `docs/LUMEN_PREMIUM_FINAL_DESIGN.md` and `docs/USER_EXPERIENCE_ROADMAP_HE.md`. When they conflict, the owner's latest instruction wins.

## Priorities
| Severity | Area |
|---|---|
| P0 | Unusable game, broken screen, hidden board; data loss; security failure |
| P1 | Line drawing, questions, scoring, saving; Desktop/Tablet/Mobile breakage; production deploy |
| P2 | Sound and liquid fill; intermission games and prizes; languages, question bank, variety |
| P3 | Extra skins and animations; future monetisation (planning only) |

## 1. UI / UX (P0–P1)
- Premium arcade look: glass, depth, rich gradients, thick raised buttons, smooth animation. Fonts 700+ only, high contrast.
- Board is the central and largest element. No overlaps, no horizontal scroll, no clipped or vertical (squeezed) text, no nested scroll.
- RTL for Hebrew/Arabic, LTR for others.
- Desktop: balanced header, board centre, score/prize area, only essential info on screen, secondary controls in a menu, no long scroll in normal play, no duplicate menus.
- Tablet: its own layout, whole board visible, drawing without scroll friction.
- Mobile: game-app feel, large touch targets, safe areas, hamburger menu, minimal top bar.
- Verify at 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080 in real browser viewports.

## 2. Game engine (P1)
Draw between adjacent dots in all four directions, never diagonal; a legal line opens exactly one question; square closing, ownership, scoring, rewards, stage transition, new game. Modes: solo, vs computer, two players on one device, vs friend online; infrastructure for up to four players.

## 3. Liquid fill (P2)
Rising liquid, moving wave, bubbles, player colour, styled name, avatar/symbol, fireworks, fill sound, win sound, points/credits, smooth continuation — inside the real game, scaled to square size.

## 4. Sound (P2)
Cues for start, line, correct, wrong, timer, timeout, capture, fill, bonus, combo, prize, coins, fireworks, win, loss, stage change, intermission, game end. Volume, mute, test, saved preferences, iOS Safari and Android audio policies. Not "working" until verified on a device.

## 5. Intermission games (P2)
Simon, memory pairs, tic-tac-toe vs computer, wheel of fortune, scratch card, hangman-style word guess (no imagery of hanging people), trivia sword, scissors, cake slice, balloon pop, bonus/premium questions, and any others already in the repo. Each: own design, translated instructions, real mechanic, sound, animation, success condition, reward, continue, desktop + touch. No button that does not launch a real game. Celebration after a stage, then a rotating intermission.

## 6. 100 stages (P1–P2)
Progressive unlock, saved completion, controlled board growth, rising difficulty, prizes, achievements, bonus events, rotating intermissions, final celebration, ranking/podium per mode. No stage may become impossible because of question shortage.

## 7. Questions and languages (P2)
Target 5,000 valid, unique, verified questions per language in he/en/ru/fr/ar/es — never invented to hit a number. Topics include history, geography, capitals, leaders, Israeli politics, TV (Friends, Grey's Anatomy, Days of Our Lives, קרובים קרובים), Eurovision, Disney, film, Israeli and international music, cars, airlines, sports, culture, world languages/translation. Reshuffle questions and answers each game, category variety, no repeats, saved history, automatic duplicate check, source verification, full translation, no mixed languages in one question, difficulty matching. Player question suggestions with QA and reward.

## 8. Premium questions and rewards (P2)
Bonus question may double score, give credits/stars or capture an adjacent legal square; if only the last square remains, adapt the reward. No double rewards from refresh, double click or network failure.

## 9. Skins (P3)
Original, Urban, Vintage Classic, Retro Arcade, Pop Art, Futuristic AI Purple/Orange; switch from a palette icon; must not hurt readability, accessibility or board size.

## 10. Players and data (P1)
Google and email login, player name (incl. Hebrew on iPhone), saved skin, categories, achievements, credits, stars, score, stage progress, multiplayer, cross-device for signed-in users. Never delete data. Check Supabase permissions/RLS, privacy, terms and accessibility under Israeli law; never claim full legal compliance without review.

## 11. Deployment (P1)
Vercel project `trivia-squares` (`prj_SmQQVjSCstHAxeHQdqLpAOnpcWBT`, team `team_1rUcH5ZlcvHwQ9s0ibhNfZy9`), production branch `main`, URL https://trivia-squares.vercel.app. Fix the existing project; never move hosting without approval; never bypass a 403.

## Release gate
TypeScript, build, unit, integration and E2E tests pass; no blocking browser errors, no layout breakage, no drawing regression, no data loss, no unauthorised security change, no added cost. After deploy: production commit, HTTP 200, assets, welcome screen, enter game, draw + question, square capture, Desktop/Tablet/Mobile, saved name and progress, sound and animation where testable.
