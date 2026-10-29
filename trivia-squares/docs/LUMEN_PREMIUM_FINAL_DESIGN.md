# TRIVIA SQUARES / LUMEN NOTEBOOK — FINAL PREMIUM DESIGN v3.1
**RTL/Hebrew · original art only · free-tier friendly · accessibility-first**

## Three specialist design roles, one integrated design contract
**A. Visual Art Director:** world art direction, luminous translucent notebook, editorial premium hierarchy, original collectible card illustrations.
**B. Player Experience Designer:** first move within 10 seconds; expressive drawing/celebration; collectible album and one intermission challenge; understandable rewards, no high-pressure retention tricks.
**C. Frontend/Accessibility Lead:** mobile-first pointers, DOM/keyboard navigation, 60s timer and original WebAudio feedback; motion adaptation; RLS-protected server rewards and tests.

These are coordinated roles and deliverables, not a claim that three independent paid external agent sessions have run.

## Visual direction — "The Living Notebook"
The central surface is semi-transparent squared paper (24px fine grid, faint pink margin, subtle ring binder holes) floating inside a light-refracting glass chamber. The world is *visible through the paper*. Do not replace with a solid dark rectangle. No 1990s beveled buttons or dense dashboard blocks.

### Layout
Top glass identity dock: avatar/Google photo, name and online state. Large editorial title with luminous typography, compact mission text. World navigation as four **rich cinematic postcards**. Main arena dominates desktop at ~65% of content width, while one calm sidebar groups room controls, player identity and wallet. On small phones the gameplay board precedes secondary settings; controls remain easily reachable.

### Tokens
- Midnight ink #091529; deep navy #101C39; text ivory #F5FAFF
- Frosted glass rgba(13,29,60,.32), blur(24px), 1px white border at .22 opacity
- Headline glow #E5F5FF; primary liquid gold #FFE4A1–#FFB75E
- Orchard: mint jade + bioluminescent fireflies
- Crystal: lilac + cyan gem lattice
- Clouds: ice blue + layered atmospheric ribbons
- Galaxy: orchid + starlight particles
- Board: translucent rgba(235,248,255,.095), grid-line rgba(230,244,255,.24), marker texture
- Collectible cards: holographic foil, illustrated portrait / vinyl / magical letter, rarity chip, short clue, album slot.

### Interaction and sound
Freehand dot-to-dot marker. Pen friction while moving, unlock only on correct answer. 60 second question: rotating hourglass, sound and accessible remaining-time text. Completion: square fill + original success jingle. World completion: featured collectible **illustration**, saved to album, optional single intermission game:
- "נחש את המילה": guess a short clue word; no imagery of hanging people.
- "גלגל הפתעות": free non-cash virtual reward, one spin per completed match.
No gambling stakes and no payment. One claim and one intermission prize per account+match. All authenticated rewards live in private Supabase tables with restricted RPCs, not client-submitted currency changes.

## Ethical engagement
Reward mastery, meaningful discoveries and exploration. No purchase of advantage in PvP; no loss-aversion popups, mandatory streaks, deceptive scarcity, indefinite autoplay, or user-specific pressure targeting minors. Animations can be reduced, sound disabled. Clear stop and resume.

## Design QA gates
1. World backgrounds look materially different, not mere flat hue adjustments.
2. The notebook is translucent: underlying ambient gradient is visible through the grid and cells.
3. Marker color is customizable and persists per player.
4. Google full name/avatar only for signed-in account.
5. Responsive 320px–1440px and RTL; target >=44px for important touch controls.
6. Keyboard and WCAG 2.1 AA automated checks; human screenreader/Safari checks remain manual.
7. Collectible card genuinely contains original vector picture, not just one emoji.
8. Unlock not granted if game incomplete; claim idempotent; mini-game reward cannot be replayed.
9. Previous working gameplay and backend security not regressed; TypeScript, Playwright, SQL checks green.
10. Vercel preview not labeled public production unless newest commit deployed and full auth/legal QA done.
