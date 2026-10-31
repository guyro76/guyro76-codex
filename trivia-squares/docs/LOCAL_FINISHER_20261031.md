# Local implementation, 2026-10-31

Base: 1028b69a7c50d8e4cf1564bbde963db5507e4fde. No external writes or deployment.

Implemented three previously missing local intermissions: scratch card (six distinct targets), trivia sword (three question-symbol targets, no fruit), scissors (three ribbon marks). Pointer capture supports dragging; each target also supports keyboard activation. All instructions have he/en/ru/fr/ar/es copies. Bold text, high-contrast cream/purple surfaces, minimum 44px targets and reduced-motion styling.

Challenges participate in local stage rotation and the existing one-prize-per-stage album path. Online choices deliberately remain unchanged because the live RPC contract has not been migrated. These implementations are not a claim of complete online support.

Reset stale guess/busy state between stages. Updated desktop regression to allow the intended premium follow-up question before expecting its dialog to close. This addresses a concrete false assumption in the test; elimination of the observed CI flake still needs execution.

Validation:
- TypeScript passed after final edits.
- 100/100 unit tests passed.
- Production build completed successfully; existing missing-ESLint warning means lint was not executed.
- Playwright discovered 14 focused desktop/mobile cases. This is discovery, not a passing execution.
- Browser installation failed with empty/invalid ZIP downloads, including a retry using the runtime's Playwright version. Browser interaction, screenshots and reload E2E remain unverified.
- git diff --check passed.

Next acceptance: execute new intermission E2E (completion threshold, one reward, reload), drag/touch checks on real iOS and Android, and compact desktop premium flow. Server support requires a separately reviewed migration and explicit authorization before application. Data provenance/reserve blockers from RELEASE_AUDIT_20261031_HE.md remain open.
