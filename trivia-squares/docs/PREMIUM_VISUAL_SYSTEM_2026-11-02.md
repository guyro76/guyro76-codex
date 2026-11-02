# Trivia Squares Premium Visual System

Implementation plan, not deployed. Preserve existing saves, scoring, questions and multiplayer.

## Visuals
Original premium arcade look inspired by the production polish of popular puzzle games, without copying their artwork. Bold readable type, accessible contrast, six existing skins, layered beveled tiles, specular highlights and depth. Mobile-first RTL and LTR.

## Motion
Tap spring 120ms; correct answer confirmation 180ms; liquid tile fill 400ms; square completion burst 600ms; level victory stars and confetti 1200ms, skippable. Cap particle count at 20 per effect. Reduced-motion mode removes shake, particles and parallax. Provide keyboard equivalents for swipe actions.

## Engineering
Prefer CSS transforms and opacity, pooled Canvas particles, dynamic loading, pause animations when hidden, persisted mute. No paid assets, tracking, schema migrations or changes to player state. Aim for 60fps on capable devices with graceful degradation.

## Acceptance
Screenshot and interaction checks across Hebrew, English, Russian, Arabic, French and Spanish, six skins, iPhone, Android, tablet and desktop. Verify saved stage 9, 100 stages, question correctness, credits and multiplayer. Run typecheck, build, Playwright, accessibility and security checks. Use a disabled-by-default feature flag and verify production SHA before enabling.

## Order
Inspect components and styles; implement tile/motion primitives; add reward and intermission effects; run regression tests; release only after verification.
