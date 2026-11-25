// The Postwave tool catalog, shared by every MCP transport.
//
// One definition drives all four clients — Claude Code and Codex over stdio,
// ChatGPT Developer Mode and Claude.ai custom connectors over HTTP — so the
// tools can never drift between them.

import { generateCarouselFallback } from "@/lib/carousel-fallback";
import {
  generatePostFallback,
  generatePresentationFallback,
  generateReelsFallback,
} from "@/lib/content-fallback";
import { getDimensions, getTemplate } from "@/lib/carousel-config";
import {
  scoreGeo,
  generateJsonLd,
  slidesToFaq,
  toAnswerFirst,
  enrichForGeo,
} from "@/lib/geo";
import { searchGoogleNews } from "@/lib/news";
import { postToPlatforms, isComposioConfigured } from "@/lib/composio";
import { postToTikTok, isTikTokConfigured } from "@/lib/tiktok";

export interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, never>) => Promise<unknown>;
}

interface Slide {
  headline: string;
  body: string;
  imageQuery?: string;
}

const CONTENT_TYPES = ["carousel", "post", "story", "presentation", "reels"] as const;
const PLATFORMS = ["instagram", "facebook", "linkedin", "tiktok"] as const;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

/** Generate slides for a content type using the free, always-available engine. */
function generate(contentType: string, input: {
  topic: string;
  platform: string;
  objective: string;
  audience: string;
  tone: string;
}): { slides: Slide[] } {
  switch (contentType) {
    case "post":
      return generatePostFallback(input);
    case "presentation":
      return generatePresentationFallback(input);
    case "reels":
      return generateReelsFallback(input);
    default:
      // carousel and story share the multi-slide shape
      return generateCarouselFallback(input);
  }
}

export const TOOLS: McpTool[] = [
  {
    name: "postwave_create_content",
    title: "Create Postwave content",
    description:
      "Generate a complete, ready-to-publish piece of Hebrew social media content from a topic. " +
      "Returns the slides (headline + body each), the target dimensions for the platform, and a GEO " +
      "score measuring how likely the piece is to be cited by AI answer engines. " +
      "Use for: carousels, single posts, stories, presentations, and reel scripts.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The subject of the content, in Hebrew or English. Required.",
        },
        contentType: {
          type: "string",
          enum: [...CONTENT_TYPES],
          description: "What to produce. Defaults to 'carousel' (7 slides).",
        },
        platform: {
          type: "string",
          enum: [...PLATFORMS],
          description: "Target network — sets the output dimensions. Defaults to 'instagram'.",
        },
        audience: {
          type: "string",
          description: "Who the content speaks to, e.g. 'בעלי עסקים קטנים'.",
        },
        tone: {
          type: "string",
          description: "Voice, e.g. 'מקצועי', 'ידידותי', 'נועז'.",
        },
        objective: {
          type: "string",
          description:
            "Goal: awareness, engagement, leads, sales or authority. Shapes the call to action.",
        },
        geoOptimize: {
          type: "boolean",
          description:
            "When true, restructure each slide answer-first so AI engines can lift it as a citation. Defaults to true.",
        },
      },
      required: ["topic"],
    },
    handler: async (args) => {
      const a = args as Record<string, unknown>;
      const topic = str(a.topic);
      if (!topic) throw new Error("topic is required");

      const contentType = str(a.contentType, "carousel");
      if (!CONTENT_TYPES.includes(contentType as (typeof CONTENT_TYPES)[number])) {
        throw new Error(`contentType must be one of: ${CONTENT_TYPES.join(", ")}`);
      }
      const platform = str(a.platform, "instagram");
      const geoOptimize = a.geoOptimize !== false;

      const input = {
        topic,
        platform,
        objective: str(a.objective, "authority"),
        audience: str(a.audience, "קהל מקצועי"),
        tone: str(a.tone, "מקצועי"),
      };

      const { slides: raw } = generate(contentType, input);
      const slides: Slide[] = geoOptimize ? enrichForGeo(raw) : raw;

      const dimensions =
        getDimensions(platform, contentType) || { width: 1080, height: 1350, ratio: "4:5" };
      const template = getTemplate("modern");
      const geo = scoreGeo(slides.map((s) => `${s.headline}\n${s.body}`).join("\n\n"));

      return {
        topic,
        contentType,
        platform,
        slideCount: slides.length,
        slides: slides.map((s) => ({ headline: s.headline, body: s.body })),
        dimensions,
        template,
        geo: { score: geo.score, grade: geo.grade, topFixes: geo.topFixes },
        note:
          "Slides are editable. Open Postwave to render them as images and publish, " +
          "or call postwave_publish with a caption.",
        geoGuidance:
          "The generator structures content for citation but cannot supply facts. " +
          "To raise the GEO score further, add a real statistic, name its source, " +
          "and include one expert quote — these are the three highest-weighted " +
          "signals and they must come from the user, not be invented.",
      };
    },
  },

  {
    name: "postwave_geo_score",
    title: "Score content for AI citation",
    description:
      "Measure how likely a piece of text is to be quoted inside an AI-generated answer " +
      "(ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews). Scores eight weighted signals — " +
      "answer-first opening, statistics, source attribution, extractable structure, named entities, " +
      "quotations, freshness and readability — and returns the highest-leverage fixes. Works in Hebrew and English.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The text to score." },
        slides: {
          type: "array",
          description: "Alternatively, slides to score as one piece.",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              body: { type: "string" },
            },
            required: ["headline", "body"],
          },
        },
      },
    },
    handler: async (args) => {
      const a = args as Record<string, unknown>;
      const slides = Array.isArray(a.slides) ? (a.slides as Slide[]) : [];
      const text =
        str(a.text) || slides.map((s) => `${s.headline}\n${s.body}`).join("\n\n");
      if (!text) throw new Error("Provide either text or slides");

      const r = scoreGeo(text);
      return {
        score: r.score,
        grade: r.grade,
        checks: r.checks.map((c) => ({
          signal: c.signal,
          label: c.label,
          score: c.score,
          weight: c.weight,
          evidence: c.found.slice(0, 5),
          advice: c.advice,
        })),
        topFixes: r.topFixes,
      };
    },
  },

  {
    name: "postwave_geo_optimize",
    title: "Make content citable by AI engines",
    description:
      "Restructure slides so AI answer engines can lift them as citations, and emit the structured " +
      "data that makes the piece machine-readable: Article + FAQPage JSON-LD plus derived Q&A pairs. " +
      "Returns the before/after GEO score so the gain is visible. Does not invent facts — it reorders " +
      "existing sentences answer-first.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Subject of the piece." },
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              body: { type: "string" },
            },
            required: ["headline", "body"],
          },
        },
        url: { type: "string", description: "Canonical URL, embedded in the JSON-LD." },
      },
      required: ["slides"],
    },
    handler: async (args) => {
      const a = args as Record<string, unknown>;
      const slides = Array.isArray(a.slides) ? (a.slides as Slide[]) : [];
      if (slides.length === 0) throw new Error("slides is required");
      const topic = str(a.topic, "תוכן");

      const before = scoreGeo(slides.map((s) => `${s.headline}\n${s.body}`).join("\n\n"));
      const optimized = slides.map((s) => ({
        headline: s.headline,
        body: toAnswerFirst(s.headline, s.body),
      }));
      const after = scoreGeo(
        optimized.map((s) => `${s.headline}\n${s.body}`).join("\n\n")
      );

      return {
        slides: optimized,
        faq: slidesToFaq(optimized),
        jsonLd: generateJsonLd({ topic, slides: optimized, url: str(a.url) || undefined }),
        geoBefore: { score: before.score, grade: before.grade },
        geoAfter: { score: after.score, grade: after.grade },
        remainingFixes: after.topFixes,
      };
    },
  },

  {
    name: "postwave_trends",
    title: "Find trending topics",
    description:
      "Fetch live trending headlines to use as content topics. Covers AI, social media trends, " +
      "Instagram, TikTok, Facebook, digital marketing and social management, in Hebrew. " +
      "Use this before postwave_create_content to ground a piece in something current.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Topic area to search. Defaults to a broad sweep of marketing and AI news.",
        },
        limit: {
          type: "number",
          description: "How many headlines to return (1–20). Defaults to 10.",
        },
      },
    },
    handler: async (args) => {
      const a = args as Record<string, unknown>;
      const query = str(a.query, "שיווק דיגיטלי בינה מלאכותית רשתות חברתיות");
      const rawLimit = typeof a.limit === "number" ? a.limit : 10;
      const limit = Math.max(1, Math.min(20, Math.round(rawLimit)));

      const articles = await searchGoogleNews(query, limit);
      return {
        query,
        count: articles.length,
        trends: articles.map((n) => ({
          title: n.title,
          source: n.source,
          url: n.url,
        })),
      };
    },
  },

  {
    name: "postwave_publish",
    title: "Publish to social networks",
    description:
      "Publish a caption and image to connected social accounts (Instagram, Facebook, LinkedIn, TikTok). " +
      "Requires Postwave's publishing integration to be configured; when it is not, this reports exactly " +
      "what is missing instead of failing silently. This performs a real, public post — confirm the " +
      "caption and target networks with the user before calling it.",
    inputSchema: {
      type: "object",
      properties: {
        platforms: {
          type: "array",
          description: "Networks to publish to.",
          items: { type: "string", enum: [...PLATFORMS] },
        },
        caption: { type: "string", description: "The post caption." },
        imageUrl: {
          type: "string",
          description: "Public URL of the image or video to attach.",
        },
      },
      required: ["platforms", "caption"],
    },
    handler: async (args) => {
      const a = args as Record<string, unknown>;
      const platforms = (Array.isArray(a.platforms) ? a.platforms : [])
        .map((p) => String(p).toLowerCase())
        .filter((p) => PLATFORMS.includes(p as (typeof PLATFORMS)[number]));
      const caption = str(a.caption);

      if (platforms.length === 0) {
        throw new Error(`platforms must include at least one of: ${PLATFORMS.join(", ")}`);
      }
      if (!caption) throw new Error("caption is required");

      const imageUrl = str(a.imageUrl) || undefined;

      // TikTok is not reachable through the generic connector — it has its own
      // API and its own credentials, so it is routed separately rather than
      // being silently dropped.
      const wantsTikTok = platforms.includes("tiktok");
      const others = platforms.filter((p) => p !== "tiktok");

      const results: { platform: string; successful: boolean; error?: string | null }[] = [];

      if (others.length > 0) {
        if (!isComposioConfigured()) {
          for (const p of others) {
            results.push({
              platform: p,
              successful: false,
              error:
                "Publishing is not connected. Set COMPOSIO_API_KEY and connect the account " +
                "in Postwave settings.",
            });
          }
        } else {
          results.push(...(await postToPlatforms(others, caption, imageUrl)));
        }
      }

      if (wantsTikTok) {
        if (!isTikTokConfigured()) {
          results.push({
            platform: "tiktok",
            successful: false,
            error: "TikTok is not connected. Set TIKTOK_ACCESS_TOKEN.",
          });
        } else {
          // Default to the draft inbox: a direct post needs an audited TikTok
          // app, and a silent failure is worse than a draft the user finishes.
          const r = await postToTikTok({
            caption,
            imageUrls: imageUrl ? [imageUrl] : [],
            draft: true,
          });
          results.push({
            platform: "tiktok",
            successful: r.ok,
            error: r.ok ? null : r.error,
          });
        }
      }

      return {
        published: results.some((r) => r.successful),
        results,
        note: wantsTikTok
          ? "TikTok posts land in the creator's drafts for final approval in the app."
          : undefined,
      };
    },
  },
];

export const TOOLS_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

/** Tool list in the shape MCP's `tools/list` expects. */
export function listToolSchemas() {
  return TOOLS.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

/** Execute a tool, returning MCP `tools/call` content. */
export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const tool = TOOLS_BY_NAME.get(name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }
  try {
    const result = await tool.handler((args || {}) as Record<string, never>);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
}
