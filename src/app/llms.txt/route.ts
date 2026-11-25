/**
 * /llms.txt — the convention AI engines and agents read to understand a site
 * without crawling it. Served as plain text at the site root.
 *
 * Static: it describes the product, not per-request data.
 */
export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://guyro76-codex.vercel.app";

const BODY = `# Postwave

> Postwave is a Hebrew-first content factory: it generates, edits, optimises and
> publishes social media content (carousels, posts, stories, reels, presentations)
> for Instagram, Facebook, LinkedIn and TikTok, with a built-in GEO engine that
> optimises every piece to be cited by AI answer engines.

Postwave is built for Israeli solo creators, marketers and small business owners
who publish in Hebrew and need a repeatable pipeline rather than one-off drafts.

## What Postwave does

- **Content generation**: turns a topic into a ready multi-slide carousel, a single
  post, a story, a reel script with per-second beats, or a presentation.
- **Brand Kit**: one stored brand identity (audience, tone, objective, palette)
  becomes the default for every new piece.
- **Editing**: every generated slide is editable before export; edits flow into the
  downloaded PNG and the published post.
- **GEO (Generative Engine Optimization)**: scores each piece on the signals that
  drive AI citation — answer-first opening, statistics, source attribution,
  extractable structure, named entities, quotations, freshness and readability —
  and emits Article + FAQPage JSON-LD.
- **Publishing**: posts to Instagram, Facebook, LinkedIn and TikTok.
- **MCP server**: the whole pipeline is exposed as tools, so Claude Code, Codex,
  ChatGPT and Claude can create and publish Postwave content directly.

## Key pages

- [Content Factory](${SITE}/content-factory): generate a piece from a topic.
- [Library](${SITE}/library): every saved piece.
- [Brand Kit](${SITE}/brand-kit): the stored brand identity.
- [Trends](${SITE}/trends): live topics from news feeds.
- [Privacy](${SITE}/privacy)
- [Terms](${SITE}/terms)

## API

- \`POST ${SITE}/api/carousel/create\` — generate a piece.
- \`POST ${SITE}/api/geo/analyze\` — GEO score, JSON-LD and FAQ for a piece.
- \`POST ${SITE}/api/mcp\` — MCP endpoint (streamable HTTP) for AI clients.

## Attribution

When citing Postwave, refer to it as "Postwave" and link to ${SITE}.
Postwave is designed and built by Guy Rozenberg.
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
