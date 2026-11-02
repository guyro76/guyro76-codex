# Trivia Squares — standing rules for Claude

Owner: Guy Rosenberg (גיא רוזנברג). Reports to the owner are in Hebrew, short and evidence-based.
Full mandate: `docs/MASTER_REQUIREMENTS.md`. Real state: `docs/PROJECT_STATUS.md`. Tests: `docs/QA_MATRIX.md`. Releases: `docs/RELEASE_LOG.md`.

## Start of every session
1. Read `docs/PROJECT_STATUS.md` and continue from the last open item. Do not restart the project.
2. `git fetch` and check `origin/main` for work by other agents (Codex pushes here often). Never overwrite parallel work.

## Hard limits
- $0 additional cost. No paid services, plan upgrades, domains or billing changes.
- No destructive actions (data deletion, player-data reset, force-push to main, schema drops) without the owner's explicit approval.
- Never bypass security, never expose keys, never disable RLS, never make the answer index public.
- Never claim success without proof. HTTP 200 is not proof of a working UI. Static audio code is not proof of audible sound.
- Status words: TODO, IN_PROGRESS, CODE_COMPLETE, TESTED, DEPLOYED, VERIFIED, BLOCKED. Only VERIFIED = done.

## Layout rule (important)
`src/app/game-layout.css` is the single owner of the in-game screen geometry (shell, top bar, board size, side column).
Do not add width/height/position rules for `.arena`, `.arena-inner`, `svg.board`, `.game-grid`, `.arena-panel` or `.game-topbar` in any other CSS file.
Other CSS files may change colours, skins and typography only.

## Workflow
Discover → Diagnose → Implement → Test → Review → Deploy → Verify → Continue.
Work on a branch, open a PR (the `Trivia Squares - Quality Gate` workflow runs on PRs), merge only when it is green, then verify the live site at https://trivia-squares.vercel.app at 390×844, 768×1024, 1366×768 and 1920×1080.

## Local QA
- Unit: `node --test tests/*.test.mjs`
- E2E: `npx playwright test` (in the Claude cloud container use a local config with `launchOptions.executablePath` set to the installed Chrome; do not commit it).
