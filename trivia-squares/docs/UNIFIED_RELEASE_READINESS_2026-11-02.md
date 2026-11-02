# Trivia Squares - Unified pre-deployment release gates
Updated 2026-11-02. This is a tracked readiness checklist, NOT evidence that features are implemented or approved.

## Product and game
- [ ] Solo, computer, local and online rooms for up to four players; server-authoritative turns and reconnect.
- [ ] 100 stages with saved progress and no reset; progressive board sizing; end-of-level rewards.
- [ ] All intermissions playable and accessible: wheel, scratch card, hangman, sword slicing, scissors, cake slicing and balloon popping. Include touch, keyboard, reduced motion and fallback.
- [ ] Six complete locales HE/EN/RU/AR/FR/ES; no mixed-language questions or answers; RTL/LTR checks.
- [ ] 5,000 individually verified unique questions per locale with source provenance, balanced topics and no premature repeat; verify on live DB, not by raw counts alone.
- [ ] Add multilingual vocabulary/phrases category with correct transliterations, language identification, native speaker review and unambiguous distractors.
- [ ] Questions from user submissions are moderated, verified and deduplicated before publication.
- [ ] Preserve all six skins, sound/mute, player profile, achievements, stars, coins and hint/skip ledger; no billing until separately authorized.
- [ ] Premium original artwork and audio (not copied from other games), 3D tile depth, liquid fill, victory particles, responsive animations and 60fps target with graceful degradation.

## Security and privacy - mandatory, no shortcuts
- [ ] Inventory all personal data, purposes, processors, storage regions, retention, backups and deletion flows. Minimize collection, especially for minors.
- [ ] Verify Supabase RLS on every player/room/ledger/admin table; deny anonymous cross-user access; tests for ownership escalation and IDOR.
- [ ] Keep service-role credentials server-only; rotate any exposed secrets; no keys/tokens in browser bundles, Git, logs or client errors.
- [ ] Validate all server inputs, room join tokens, question answers and scoring on server; rate-limit auth, invites, submissions and game actions.
- [ ] Atomic coin/credit transactions and idempotent reward grants; anti-cheat and replay protection.
- [ ] Session security, OAuth redirect allowlist, CSRF where applicable, secure cookies, logout/revocation, account deletion/export.
- [ ] Security headers including CSP with tested exceptions, HSTS, frame-ancestors, referrer policy, permissions policy; avoid breaking OAuth.
- [ ] Dependency and secret scanning, branch protection, CI gates, rollback, backup restore rehearsal and incident-response contact.
- [ ] No sensitive personal information or full tokens in analytics, monitoring or bug reports.
- [ ] Privacy policy, terms, accessibility statement and contact details reviewed against current Israeli law by qualified counsel before public release. Do not claim legal compliance merely from this checklist.

## Consent and tracking
- [ ] Separate required functional storage from optional analytics/advertising cookies and SDKs.
- [ ] Block non-essential cookies and tracking until valid opt-in where required; record consent version/time/categories and support withdrawal and changed preferences.
- [ ] Do not use bundled 'accept everything' as the only choice; provide clear reject/necessary-only and settings controls where required.
- [ ] Explicitly explain account data storage, game progress, processors and deletion rights in plain Hebrew; avoid treating consent as universal lawful basis.
- [ ] Review minors' data, age-appropriate notices and parental authorization requirements before launching social features.
- [ ] Document privacy impact assessment and retention schedule; do not invent a universal cookie law rule.

## Accessibility, QA and release
- [ ] WCAG 2.2 AA target: keyboard, focus, contrast, bold legible fonts, screen reader labels, semantic dialogs, captions/audio alternatives, touch targets and reduced motion.
- [ ] Device matrix: iPhone Safari, Android Chrome, tablet and desktop; slow network, offline/reconnect, RTL names and responsive no-horizontal-scroll.
- [ ] Regression: stage 9 save, 100-stage navigation, score/wallet consistency, locale fallback, question repeats, lines in all permitted directions, game audio and color switch.
- [ ] Typecheck, production build, Playwright E2E, accessibility scans, security/RLS tests and all 12 locale lanes must be green on exact commit.
- [ ] Stage on existing Vercel project, inspect SHA and logs, smoke-test auth/game/privacy/consent, then promote only after release signoff. Rollback plan tested.

## Existing infrastructure
- GitHub repo: guyro76/guyro76-codex; root: trivia-squares.
- Premium branch: feature/trivia-premium-visual-system-20261102; PR #85.
- Vercel project: trivia-squares, prj_SmQQVjSCstHAxeHQdqLpAOnpcWBT.
- Deployment currently blocked by Vercel 403. No new production deployment confirmed.
- Do not create a new project, spend money, reset player data, enable ads or deploy unverified schema changes.

## Implementation priority
P0: audit current implementation against checklist and create evidence per gate.
P1: privacy/security/RLS and consent controls before any public rollout.
P2: complete gameplay/intermissions, locale quality and premium UI.
P3: end-to-end QA and release gate evidence.
P4: resolve deployment authorization and deploy verified SHA to existing project.
