# Trivia Squares - Release-readiness gate (2026-10-29)

## Passed / verified
- Supabase parent: social-hub / ueswnbbyxytvmjydvvwv (no new billable project or branch)
- Isolated schema trivia_squares: profiles, progress, matches, questions
- Four RLS-enabled tables. Unauthenticated and authenticated roles have NO direct USAGE on private schema and NO direct SELECT on secret question bank
- 32 active Hebrew trivia questions with four answers and valid correct index, as verified by SQL
- Eight explicitly authenticated SQL RPCs; anon EXECUTE revoked and checked
- GitHub feature/trivia-squares contains server-authoritative match moves, question verification and bot RPC
- The Next.js build on Vercel completed READY after correcting root configuration and vulnerable Next.js version
- Touch/pointer interaction now requires drawing from one dot to an adjacent dot; clicking empty edges is no longer a move
- SVG felt-tip marker texture, soft ink trail and claimed-square glow implemented in frontend
- Four world theme UI with user color, avatar and score HUD implemented

## NOT passed / blocking public release
1. Vercel API rejects setting and listing environment variables with HTTP 403. Set the following in Vercel project's Environment Variables UI for Production and Preview. Do not paste values into chat or commit secret keys:
   - NEXT_PUBLIC_SUPABASE_URL: retrieve the project URL from Supabase Connect
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: retrieve the sb_publishable key from Supabase API Keys
   Note: these are designed as public browser config values but still need to be configured in Vercel build.
2. After env configuration, redeploy and verify working signup, email verification, Google login, persisted session and logout. The same Supabase Auth provider is SHARED with social-hub; do not overwrite its Site URL, append allowed redirect URL for Trivia's production domain.
3. Verify actual Google OAuth provider credentials and authorized redirects in Google Cloud and Supabase Auth UI. No evidence yet that Google sign-in is configured for this app.
4. Run real signed-in match tests in two separate browsers, both successful and failed answers, out-of-turn rejection, double-click/double-submit, disconnect/reconnect and bot turns. Current successful builds do not prove gameplay correctness.
5. Build end-to-end browser automation tests (Playwright) and accessibility tests. Existing geometry tests are committed but not yet executed in CI.
6. Complete authentic privacy policy, terms of service, accessibility statement, operator contact details and child data safeguards before accepting public registration in Israel. Existing public legal pages are placeholders.
7. Finish bonus two-closure tokens, fruit/diamond/life economy UI, level/world rewards and monetization feature flags. Payment stays disabled until explicitly approved.
8. Verify anonymous visitors can open the intended production URL AFTER checks and after explicitly switching Vercel deployment protection to an appropriate public setting. Currently preview may be Vercel-auth protected.

## Security policy
Do not use a service_role key in browser code. Do not disable RLS for convenience. Do not remove the schema isolation or make the question answer index public.
Do not claim product is fully launched when a Vercel deployment shows READY. READY confirms deployment build, not authentication, E2E correctness or legal compliance.

## Next action
Owner action required: grant Vercel integration permission to edit environment variables or configure both public values in the Vercel UI. No workaround involving unauthorized secrets. After that, run authenticated tests and re-deploy.


## 2026-10-29 follow-up repair and CI audit

- Reviewed recent Vercel failure notification emails in Gmail for trivia-squares; the failed commits `888303c`, `248ad75`, `d80a3ef`, `a753d8c`, `c537325` are older than the latest confirmed successful builds.
- GitHub Actions run `40845129067` for commit `3fc269cb834a9f2ff8f058c2e044074d098b992c`: SUCCESS, including strict TypeScript, gameplay/drawing unit tests and Next.js production build.
- Latest Vercel preview deployment inspected for that commit: `dpl_y5442d2R35egWdhfSTmRQ4g9iXbV`, status READY. The preview is SSO-protected, and the project reports `live:false`; this is NOT a public production release.
- Fixed a genuine online multiplayer startup bug: the host now polls the waiting room and notices when invited guest joins; before, only `playing` rooms were polled.
- Expanded vetted-format trivia pool to 104 active entries (0 invalid four-answer rows); new selection logic avoids previously served questions in a match until the bank is exhausted.
- Added DB privacy_requests with RLS, user export and deletion-request RPC; total 5 Trivia schema tables are RLS-enabled.
- 12 narrowly authenticated public RPC functions exist now; anonymous callers are denied. The functions intentionally use SECURITY DEFINER and assert `auth.uid()` and ownership/participants. Security advisors warn about intentional auth-executable SECURITY DEFINER RPC; document and review before release.
- Old bullet references to 4 tables, 8 RPCs, and 32 questions are historical and superseded by this audit.
- Environment-variable API still gives 403 for the connected Vercel integration. Do NOT claim Google/email sign-in was tested or enabled: operator must configure the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` values in Vercel Settings > Environment Variables, redeploy, configure Google OAuth provider and allowed redirect URLs in the shared Supabase Auth service (append Trivia URL without removing social-hub settings).
- Additional release gates: real two-user E2E testing, email Google login, iPhone Safari testing, question-content review, operator legal contact and accessibility audit.
- Avoid manually creating deployments on every commit: GitHub integration already auto-builds previews; review notifications against commit SHAs to avoid treating obsolete failing deploys as new errors.
