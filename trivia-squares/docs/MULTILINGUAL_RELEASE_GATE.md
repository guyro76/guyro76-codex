# Trivia Squares: release readiness audit - 2026-10-30

Mandatory target: at least 5,000 verified distinct *active* questions for each of he, en, ru, fr, ar, cumulative over 30 stages (25,000 minimum overall). Each successive stage should have more approved questions available, without reusing previously seen questions. Do not pad with alternative wording or unverified/generated answers.

The five-language frontend, locale switch, six independent skins and intermission games exist in source. Backend parity is NOT COMPLETE:
- At inspection, SQL showed 213 active Hebrew and 181 active English records; zero Russian, French and Arabic records.
- On-device Arabic, Russian and French have approximately 40 curated trivia questions each. This is not a 5,000-question release.
- Supabase locale_catalog still marked ru/fr/ar planned, and online RPC selectors supported only he/en and could fall back to Hebrew.
- Vercel READY is build status, not end-to-end acceptance.

Audit query:
```sql
SELECT l.locale, COUNT(q.id) FILTER (WHERE q.active) active,
  5000-COUNT(q.id) FILTER (WHERE q.active) shortfall
FROM trivia_squares.locale_catalog l
LEFT JOIN trivia_squares.questions q ON q.locale=l.locale
GROUP BY l.locale ORDER BY l.locale;
```

QA gate: ten language checks (two per locale), existing game/capture/premium/accessibility suites, multiplayer two browser accounts, real Supabase auth, two intermissions (wheel and word), RTL contrast, footer credit, iPhone Safari, and question correctness. Gate should fail release until 25,000 distinct approved questions exist.
