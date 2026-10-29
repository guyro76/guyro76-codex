# Trivia Squares - Supabase integration handoff

## Existing infrastructure (verified Oct 29 2026)
- Parent project: social-hub, ref `ueswnbbyxytvmjydvvwv`
- Schema: `trivia_squares`
- Tables: `profiles`, `progress`, `matches`, `questions`
- Row Level Security: enabled for all four.
- `trivia_squares` schema USAGE and table access revoked from `anon` and `authenticated`. Schema is intentionally NOT exposed to Data API.
- Question bank: 32 active Hebrew questions inserted via database operation.
- Reversible development branch NOT created. No additional billable Supabase project.
- DB migrations already applied:
  - trivia_squares_isolated_initial
  - trivia_squares_server_authoritative_rpc
  - trivia_squares_revoke_anon_rpc_access

## RPC interface (public schema, authenticated role only)
- `trivia_my_profile()` -> JSON with profile and progress; initializes own rows.
- `trivia_save_profile(p_name text,p_color text,p_avatar text,p_remember boolean)` -> validated own profile.
- `trivia_create_match(p_mode text,p_size integer)` -> UUID, mode 'bot'|'online'|'local', 3..6.
- `trivia_join_match(p_match uuid)` -> join open invite room atomically.
- `trivia_get_match(p_match uuid)` -> sanitized match state, hides secret question answer.
- `trivia_choose_edge(p_match uuid,p_edge text)` -> authenticated, validated turn/edge and question (4 answers), sets pending.
- `trivia_answer(p_match uuid,p_answer integer)` -> verifies answer index 0..3 in DB, locks match row FOR UPDATE, awards squares and credits/fruits transactionally.

## Security notes
- The admin-side correct answer index is never returned to the client.
- Critical: PostgreSQL Supabase default grants `anon` direct EXECUTE on functions. The third migration explicitly revokes it from each Trivia RPC; advisor confirms no anonymous executable Trivia function flags.
- `authenticated` security-definer RPC warnings are intentional: each function asserts `auth.uid()` and participant ownership, with narrow inputs.
- `questions` has no RLS policy on purpose, so direct client reads are denied.
- Avoid granting access to private tables or exposing this schema in Supabase API settings.

## Unfinished before public launch
- Frontend must be migrated off local-only scoring and onto the RPC interface.
- Implement server-controlled bot move, bonus tokens, categories/levels and multiplayer subscription or polling.
- Set up Google OAuth in Supabase Auth; configure production URL and allowed redirects.
- Vercel env API denies create/list with 403; OWNER must authorize the integration or configure env vars from dashboard. Never commit keys.
- Vercel root `vercel.json` belongs to a different application and is NOT to be changed; Trivia has its own `trivia-squares/vercel.json` in feature branch.
- Vercel build required upgrade to patched Next.js 15.5.28 and React 19.2.4. Deployment state must be checked before calling it live.
- Complete Israeli site legal pages and accessibility audit. Payments remain disabled.
