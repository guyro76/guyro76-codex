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
