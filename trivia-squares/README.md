# Trivia Squares - Product workspace

This is the dedicated Codex working directory for the production Hebrew trivia board game.

## Deployment choices
- GitHub source: this directory, branch `feature/trivia-squares`
- Vercel for production website and preview deployments
- Supabase Auth (Google OAuth and email) and Postgres with RLS
- Supabase game namespace/schema: `trivia_squares` if using an existing project, with tightly scoped access. Do not assume a development branch can be nested under another branch.
- Cost: no billable branch or new project is created without explicit approval of relevant cost.
- No payment processing until owner explicitly authorizes it.

## Required product
- Full game: question required before every edge placement; wrong answer leaves edge open; correct answer claims edge; completed squares score and display player color, avatar/emblem and animation/sound.
- Play vs AI, local player, or online friend with secure rooms.
- Different boards and worlds across levels, powerups, bonus double closures, fruits, diamonds, credits, hearts.
- User profiles with stored color, avatar, level and wallet.
- Four-answer trivia bank with question administration, accurate question data.
- Abuse prevention, server-authoritative moves, atomic ledger, reconnect and resume.
- Free tier now, feature flags for future paid plans; no active billing.
- RTL and accessible keyboard, mobile-first premium UI; no light-on-light or dark-on-dark font.
- Hebrew policy pages: privacy, terms, accessibility statement, contact; age-appropriate data handling for minors, deletion and export.

## Acceptance gates
Do not declare the product live until working Google and email authentication, RLS security tests, multiplayer and AI tests, backend money safety, accessibility checks and production URL verification all pass.

## Status
GitHub workspace prepared. Production app, Supabase migration and Vercel live deployment remain to be implemented.
