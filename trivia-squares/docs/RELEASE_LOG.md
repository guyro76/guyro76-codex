# Trivia Squares — release log (verified releases only)

| Date | Commit on main | PR | Change | Live verification |
|---|---|---|---|---|
| 2026-11-02 | baad71b | #88 | Language and Spanish questions answerable (bonus included); stuck questions close safely | Vercel production READY; Android E2E 2/2 against trivia-squares.vercel.app |
| 2026-11-02 | 30ff61d | #89 | Topic variety for veterans when only city questions remain | Vercel production READY; veteran E2E against live site passed (1 city in 6) |
| 2026-11-02 | cd4c855 | #92 | One geography question then other topics; suggest-a-question when only cities remain | Vercel production READY |
| 2026-11-02 | 7df39e9 | #93 | In-game redesign, full-size board on every screen, realistic art, instant scroll | CI 14/14; live board 340/679/587/876px at 390×844/768×1024/1366×768/1920×1080, drag opens a question at each |
| 2026-11-02 | 0966e64 | #94 | Scratch-off ticket; 96 fact-checked Hebrew questions in 9 new categories | CI 14/14; live: 18 topics in the picker incl. the new ones, corrected texts in the published bundle, old wrong wording absent |
| 2026-11-03 | 014b6ba | #95 | 200 campaign stages in 40 chapters | Live: 'שלב 1 / 200' at 390 and 1366, stage 150 in the menu |
| 2026-11-03 | a5c680e | #100 | Answer appeals + hourly review engine, no-leak questions (35 local, 47 server), no emoji, self-hosted font, share image, robots/sitemap, service worker, six-language menu fixes | CI 14/14, local 180/180; Lighthouse mobile 75/96/96/100 → 78/100/100/100, desktop 94 → 99 |
| 2026-11-03 | 5ab264a | #101 | Mini-games open in view, next-stage button, unique premium card per stage | Live (iPhone emulation): wheel in view after tap, prize, next stage → 'שלב 2 / 200' |
| 2026-11-03 | 81f348e | #102 | Free-licensed photo next to the correct answer, photographer credited (12 images) | CI 14/14; E2E image + credit after correct and wrong answers |
| 2026-11-03 | f198780 | #103 | 87 trivial questions replaced (+50 server rows), server-side answer check, Ultra QA fixes | CI 14/14, local 182/182; live: server question checked via trivia_check_local_answer |
| 2026-11-03 | (server) | — | Batches no longer return the answer index (stage 2) | REST check: no `correct` in either batch; live play still scores correctly |
