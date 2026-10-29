# Codex: Complete production Trivia Squares

Workspace: trivia-squares/ on feature/trivia-squares branch.
GitHub: guyro76/guyro76-codex.
Supabase: existing social-hub project ref ueswnbbyxytvmjydvvwv, isolated schema trivia_squares with RLS enabled on matches, profiles, progress, questions.
Vercel project: trivia-squares (prj_SmQQVjSCstHAxeHQdqLpAOnpcWBT), root directory trivia-squares.

The current Next.js game is preliminary only, NOT a finished product. Replace any client-authoritative game scoring with server-controlled validation. Complete:
- Fully functioning Google OAuth and email auth, callbacks, profile persistence and logout
- Real AI opponent and realtime online multiplayer with invites and race-safe turns
- Secure server-authoritative engine, question answer validation, question bank administration
- Worlds, rewards, credits, diamonds, lives, bonus 2 closures, sound and player avatar/color
- Transactional wallet and progress storage, rate limiting, anti-cheat, secure schema grants with RLS
- Secure use of trivia_squares without exposing correct answers to players
- Real policy content/Israeli legal compliance, age-appropriate safeguards and accessibility
- Tests for login, multiplayer, persistence, RLS, reward accounting, audio and responsive layouts
- No monetization or additional paid infrastructure without owner approval.

IMPORTANT: Vercel environment variable API returned 403 for this account. Resolve authorization through account UI or authorized alternate method. Do not commit secrets.
Also ensure package.json includes @supabase/ssr compatible version and lockfile before deployment.
Do not mark production-ready until verified live URL, authentication, tests, accessibility/legal review all pass.
