import { NextRequest, NextResponse } from "next/server";
import { scoreGeo, generateJsonLd, toAnswerFirst, slidesToFaq } from "@/lib/geo";

interface Slide {
  headline: string;
  body: string;
}

/**
 * GEO analysis endpoint.
 *
 * POST { text } — score a free-text block.
 * POST { slides, topic } — score the whole piece, and return the JSON-LD and
 * FAQ shape that make it liftable by ChatGPT / Perplexity / AI Overviews.
 *
 * Deliberately unauthenticated-tolerant: it performs no writes and touches no
 * user data, so the MCP server and the editor can both call it cheaply.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const slides: Slide[] = Array.isArray(body.slides) ? body.slides : [];
    const topic: string = typeof body.topic === "string" ? body.topic : "";

    const text: string =
      typeof body.text === "string" && body.text.trim()
        ? body.text
        : slides.map((s) => `${s.headline}\n${s.body}`).join("\n\n");

    if (!text.trim()) {
      return NextResponse.json(
        { error: "יש לשלוח text או slides לניתוח" },
        { status: 400 }
      );
    }

    const report = scoreGeo(text);

    // Per-slide scores let the editor show exactly which slide drags the piece down.
    const perSlide = slides.map((s, i) => {
      const r = scoreGeo(`${s.headline}\n${s.body}`);
      return { index: i, headline: s.headline, score: r.score, grade: r.grade };
    });

    return NextResponse.json({
      success: true,
      score: report.score,
      grade: report.grade,
      checks: report.checks,
      topFixes: report.topFixes,
      perSlide,
      faq: slides.length ? slidesToFaq(slides) : [],
      jsonLd: slides.length ? generateJsonLd({ topic, slides }) : null,
      answerFirst: slides.length
        ? slides.map((s) => ({
            headline: s.headline,
            body: toAnswerFirst(s.headline, s.body),
          }))
        : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GEO analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
