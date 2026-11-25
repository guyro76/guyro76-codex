// GEO — Generative Engine Optimization.
//
// Classic SEO optimises for a ranked list of blue links. GEO optimises for being
// *quoted* inside an AI-generated answer (ChatGPT, Claude, Perplexity, Gemini,
// Google AI Overviews). The levers are different: an engine cites passages that
// are self-contained, factual, attributable and structurally easy to lift.
//
// This module is dependency-free and runs on both server and client. It is
// bilingual: the heuristics understand Hebrew (the product's primary language)
// and English.

export type GeoSignal =
  | "answerFirst"
  | "statistics"
  | "citations"
  | "quotations"
  | "structure"
  | "entities"
  | "freshness"
  | "readability";

export interface GeoCheck {
  signal: GeoSignal;
  /** 0–100 for this single signal. */
  score: number;
  /** Relative importance when computing the total. */
  weight: number;
  /** Hebrew label shown in the UI. */
  label: string;
  /** Hebrew, actionable: what to change to raise this score. */
  advice: string;
  /** Evidence found in the text, for transparency. */
  found: string[];
}

export interface GeoReport {
  /** Weighted 0–100 across all signals. */
  score: number;
  grade: "מצוין" | "טוב" | "בינוני" | "חלש";
  checks: GeoCheck[];
  /** Highest-leverage fixes first. */
  topFixes: string[];
}

const HE = "֐-׿";

/** Split into sentences for Hebrew and English (., !, ?, ׃, newline). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?׃])\s+|\n+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  const m = text.match(new RegExp(`[${HE}A-Za-z0-9'’\\-]+`, "gu"));
  return m ? m.length : 0;
}

// --- individual signal detectors -------------------------------------------

/** Numbers, percentages and magnitudes — the single strongest GEO lever. */
function findStatistics(text: string): string[] {
  const patterns = [
    /\d+(?:[.,]\d+)?\s*%/gu,
    new RegExp(`\\d+(?:[.,]\\d+)?\\s*(?:אחוז|אחוזים)`, "gu"),
    new RegExp(`\\d+(?:[.,]\\d+)?\\s*(?:מיליון|מיליארד|אלף|אלפי)`, "gu"),
    // Hebrew multiplier: "פי 3", "פי 2.5" — a statistic even without a unit.
    new RegExp(`פי\\s*\\d+(?:[.,]\\d+)?`, "gu"),
    /\$\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:₪|\$|€)/gu,
    /\b\d+(?:[.,]\d+)?x\b/gu,
  ];
  const out: string[] = [];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) out.push(m[0].trim());
  }
  return [...new Set(out)];
}

/** Attribution — "according to", "לפי", a study, a named source, a URL. */
function findCitations(text: string): string[] {
  const patterns = [
    /https?:\/\/[^\s)]+/gu,
    new RegExp(`(?:לפי|על[- ]פי|בהתבסס על|מתוך)\\s+[^,.\\n]{3,60}`, "gu"),
    new RegExp(`(?:מחקר|סקר|דו"ח|דוח|נתוני)\\s+(?:של\\s+)?[^,.\\n]{3,60}`, "gu"),
    /\b(?:according to|per|based on|a study by|research from)\s+[^,.\n]{3,60}/giu,
  ];
  const out: string[] = [];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) out.push(m[0].trim());
  }
  return [...new Set(out)];
}

/** Direct quotations — engines lift quoted expert lines verbatim. */
function findQuotations(text: string): string[] {
  const out: string[] = [];
  // Straight, curly and Hebrew gershayim quote pairs.
  for (const m of text.matchAll(/["“„](.{8,220}?)["”]/gu)) out.push(m[0].trim());
  for (const m of text.matchAll(/«(.{8,220}?)»/gu)) out.push(m[0].trim());
  return [...new Set(out)];
}

/** Named entities: proper nouns, brands, ALLCAPS acronyms, @handles. */
function findEntities(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*/gu)) {
    out.push(m[0]);
  }
  for (const m of text.matchAll(/\b[A-Z]{2,6}\b/gu)) out.push(m[0]);
  for (const m of text.matchAll(/@[A-Za-z0-9_.]{2,}/gu)) out.push(m[0]);
  return [...new Set(out)].slice(0, 25);
}

/** Headings, bullets, numbered steps, Q&A — liftable structure. */
function findStructure(text: string): string[] {
  const out: string[] = [];
  const lines = text.split(/\n/u);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^(?:[-•*–]|\d+[.)]|#{1,6}\s)/u.test(line)) out.push(line.slice(0, 60));
    else if (/[?？]\s*$/u.test(line) && countWords(line) <= 14) out.push(line.slice(0, 60));
  }
  return out;
}

/** Explicit recency markers — engines prefer fresh, dated claims. */
function findFreshness(text: string): string[] {
  const out: string[] = [];
  const year = new Date().getFullYear();
  for (const m of text.matchAll(/\b20\d{2}\b/gu)) {
    const y = Number(m[0]);
    if (y >= year - 2 && y <= year + 3) out.push(m[0]);
  }
  const words = new RegExp(
    `(?:עדכני|נכון להיום|השנה|לאחרונה|החודש|מגמה חדשה|just released|this year|latest)`,
    "giu"
  );
  for (const m of text.matchAll(words)) out.push(m[0]);
  return [...new Set(out)];
}

/**
 * Answer-first: does the opening sentence state a claim directly, rather than
 * warming up? Engines extract the first self-contained assertion.
 */
function scoreAnswerFirst(text: string): { score: number; found: string[] } {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return { score: 0, found: [] };

  // A piece usually opens with its headline, and a headline is often a question.
  // The thing an engine lifts is the sentence that *answers* it, so skip a
  // leading interrogative line when there is something after it to score.
  let start = 0;
  if (sentences.length > 1 && /[?？]\s*$/u.test(sentences[0])) start = 1;

  const first = sentences[start];
  const words = countWords(first);

  let score = 0;
  const found: string[] = [first.slice(0, 120)];

  // A liftable opening claim is short and complete: roughly 6–30 words.
  if (words >= 6 && words <= 30) score += 55;
  else if (words > 30 && words <= 45) score += 30;
  else if (words >= 3) score += 15;

  // Penalise throat-clearing openers that carry no claim.
  const filler = new RegExp(
    `^(?:אז|ובכן|היי|שלום|בואו נדבר|רוצה לדעת|האם ידעת|so|well|hey|let's talk)`,
    "iu"
  );
  if (filler.test(first)) score -= 25;

  // Reward a definitional / assertive shape ("X הוא", "X is", "X מאפשר").
  const assertive = new RegExp(`(?:\\sהוא\\s|\\sהיא\\s|\\sהם\\s|\\sמאפשר|\\sגורם|\\bis\\b|\\bare\\b|\\bmeans\\b)`, "u");
  if (assertive.test(first)) score += 25;

  // Reward a number in the opening line — highly quotable.
  if (/\d/u.test(first)) score += 20;

  return { score: Math.max(0, Math.min(100, score)), found };
}

/** Readability: penalise very long sentences, which engines rarely quote. */
function scoreReadability(text: string): { score: number; found: string[] } {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return { score: 0, found: [] };
  const lengths = sentences.map(countWords).filter((n) => n > 0);
  if (lengths.length === 0) return { score: 0, found: [] };
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const longest = Math.max(...lengths);

  let score = 100;
  if (avg > 24) score -= (avg - 24) * 4;
  if (avg < 5) score -= (5 - avg) * 6;
  if (longest > 45) score -= 15;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    found: [`אורך משפט ממוצע: ${avg.toFixed(1)} מילים`, `המשפט הארוך ביותר: ${longest} מילים`],
  };
}

/** Saturating curve: the first few occurrences matter most. */
function saturate(count: number, target: number): number {
  if (count <= 0) return 0;
  return Math.round(Math.min(100, (1 - Math.pow(1 - 1 / target, count)) * 140));
}

// --- the report -------------------------------------------------------------

export function scoreGeo(text: string): GeoReport {
  const clean = (text || "").trim();

  const stats = findStatistics(clean);
  const cites = findCitations(clean);
  const quotes = findQuotations(clean);
  const structure = findStructure(clean);
  const entities = findEntities(clean);
  const fresh = findFreshness(clean);
  const answerFirst = scoreAnswerFirst(clean);
  const readability = scoreReadability(clean);

  const checks: GeoCheck[] = [
    {
      signal: "answerFirst",
      weight: 20,
      label: "תשובה בפתיח",
      score: answerFirst.score,
      found: answerFirst.found,
      advice:
        "פתח במשפט אחד שעונה ישירות על השאלה, 6–30 מילים, עם מספר אם אפשר. מנועי AI מצטטים את המשפט הראשון שעומד בפני עצמו.",
    },
    {
      signal: "statistics",
      weight: 18,
      label: "נתונים ומספרים",
      score: saturate(stats.length, 3),
      found: stats,
      advice: "הוסף 2–3 נתונים מספריים (אחוזים, סכומים, פי כמה). תוכן עם מספרים מצוטט הרבה יותר.",
    },
    {
      signal: "citations",
      weight: 16,
      label: "מקורות וייחוס",
      score: saturate(cites.length, 2),
      found: cites,
      advice: 'ציין מקור לכל טענה ("לפי מחקר של…", קישור). ייחוס מפורש מעלה דרמטית את הסיכוי לציטוט.',
    },
    {
      signal: "structure",
      weight: 14,
      label: "מבנה נשלף",
      score: saturate(structure.length, 4),
      found: structure,
      advice: "פרק לכותרות, בולטים או שאלות־תשובות. מנוע שולף בלוק מובנה בקלות רבה יותר מפסקה רציפה.",
    },
    {
      signal: "entities",
      weight: 12,
      label: "ישויות מזוהות",
      score: saturate(entities.length, 5),
      found: entities,
      advice: "נקוב בשמות מפורשים (מותג, כלי, אדם, מקום) במקום 'זה' ו'הם'. ישות ברורה מקשרת אותך לנושא.",
    },
    {
      signal: "quotations",
      weight: 8,
      label: "ציטוטים",
      score: saturate(quotes.length, 1),
      found: quotes,
      advice: "שלב ציטוט אחד של מומחה במרכאות. ציטוט הוא יחידה מוכנה להרמה אל תוך תשובת AI.",
    },
    {
      signal: "freshness",
      weight: 6,
      label: "עדכניות",
      score: saturate(fresh.length, 2),
      found: fresh,
      advice: "ציין שנה או סמן עדכניות ('נכון ל-2026'). מנועים מעדיפים מידע טרי.",
    },
    {
      signal: "readability",
      weight: 6,
      label: "קריאות",
      score: readability.score,
      found: readability.found,
      advice: "שמור על משפטים של עד ~24 מילים בממוצע. משפט ארוך מדי לא נשלף כציטוט.",
    },
  ];

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const score = Math.round(
    checks.reduce((a, c) => a + c.score * c.weight, 0) / totalWeight
  );

  const grade: GeoReport["grade"] =
    score >= 80 ? "מצוין" : score >= 60 ? "טוב" : score >= 40 ? "בינוני" : "חלש";

  // Biggest wins first: low score × high weight.
  const topFixes = [...checks]
    .filter((c) => c.score < 70)
    .sort((a, b) => (b.weight * (100 - b.score)) - (a.weight * (100 - a.score)))
    .slice(0, 3)
    .map((c) => c.advice);

  return { score, grade, checks, topFixes };
}

// --- structured data --------------------------------------------------------

export interface FaqPair {
  question: string;
  answer: string;
}

/**
 * Derive Q&A pairs from slides. A carousel slide is already a headline plus a
 * body — close to an FAQ entry, which is the format engines lift most readily.
 */
export function slidesToFaq(
  slides: { headline: string; body: string }[]
): FaqPair[] {
  return slides
    .filter((s) => s.headline?.trim() && s.body?.trim())
    .map((s) => {
      const h = s.headline.trim();
      const question = /[?？]\s*$/u.test(h) ? h : `${h}?`;
      return { question, answer: s.body.trim() };
    });
}

export interface JsonLdInput {
  topic: string;
  slides: { headline: string; body: string }[];
  url?: string;
  authorName?: string;
  brandName?: string;
  datePublished?: string;
}

/**
 * JSON-LD for the piece: an Article plus an FAQPage. Structured data is how a
 * crawler-backed engine (AI Overviews, Perplexity) resolves what the page
 * actually asserts.
 */
export function generateJsonLd(input: JsonLdInput): Record<string, unknown> {
  const {
    topic,
    slides,
    url,
    authorName = "Postwave",
    brandName = "Postwave",
    datePublished = new Date().toISOString(),
  } = input;

  const faq = slidesToFaq(slides);
  const body = slides.map((s) => `${s.headline}. ${s.body}`).join("\n\n");

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: topic.slice(0, 110),
      articleBody: body,
      inLanguage: "he-IL",
      datePublished,
      dateModified: datePublished,
      author: { "@type": "Organization", name: authorName },
      publisher: { "@type": "Organization", name: brandName },
      ...(url ? { mainEntityOfPage: { "@type": "WebPage", "@id": url } } : {}),
    },
  ];

  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Rewrite a block into answer-first shape: the claim, then the support. This is
 * a deterministic restructure, not a rephrase — it never invents facts.
 */
export function toAnswerFirst(headline: string, body: string): string {
  const sentences = splitSentences(body);
  if (sentences.length === 0) return headline;

  // Prefer a sentence carrying a number as the opening claim — most quotable.
  const idx = sentences.findIndex((s) => /\d/u.test(s));
  if (idx > 0) {
    const lead = sentences[idx];
    const rest = sentences.filter((_, i) => i !== idx);
    return [lead, ...rest].join(" ");
  }
  return sentences.join(" ");
}
