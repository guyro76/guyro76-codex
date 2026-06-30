import type { AnalysisCheck, AnalysisResult, Category, Priority } from "@/types/analyze";

type Audit = {
  score?: number | null;
  title?: string;
  description?: string;
  displayValue?: string;
  explanation?: string;
  errorMessage?: string;
};

type PageSpeedPayload = {
  id?: string;
  lighthouseResult?: {
    finalUrl?: string;
    fetchTime?: string;
    runtimeError?: { code?: string; message?: string };
    categories?: Record<string, { score?: number | null }>;
    audits?: Record<string, Audit>;
    timing?: { total?: number };
  };
  error?: { message?: string };
};

const status = (score: number) => score >= 80 ? "pass" as const : score >= 50 ? "warning" as const : "fail" as const;
const priority = (weight: number, score: number): Priority => score >= 80 ? "opportunity" : weight >= 10 ? "critical" : weight >= 7 ? "high" : "medium";

function check(id: string, category: Category, title: string, score: number, weight: number, finding: string, recommendation: string): AnalysisCheck {
  return { id, category, title, score, weight, status: status(score), priority: priority(weight, score), finding, recommendation };
}

function score100(value: number | null | undefined, fallback = 0): number {
  return typeof value === "number" ? Math.round(value * 100) : fallback;
}

function auditScore(audits: Record<string, Audit>, id: string, fallback = 0): number {
  return score100(audits[id]?.score, fallback);
}

function finding(audits: Record<string, Audit>, id: string, fallback: string): string {
  const audit = audits[id];
  return audit?.displayValue || audit?.explanation || audit?.errorMessage || fallback;
}

export async function analyzeWithPageSpeed(target: URL, originalError: unknown): Promise<AnalysisResult> {
  const startedAt = Date.now();
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", target.toString());
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.append("category", "seo");
  endpoint.searchParams.set("strategy", "desktop");
  endpoint.searchParams.set("locale", "he");
  const apiKey = process.env.PAGESPEED_API_KEY?.trim();
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22_000);
  let response: Response;
  let payload: PageSpeedPayload;
  try {
    response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
    payload = await response.json() as PageSpeedPayload;
  } catch (error) {
    const first = originalError instanceof Error ? originalError.message : "האתר חסם את הסריקה הישירה";
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${first}. גם בדיקת Google PageSpeed לא הסתיימה בזמן`);
    }
    throw new Error(`${first}. גם בדיקת Google PageSpeed לא הייתה זמינה`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok || payload.error?.message) {
    const first = originalError instanceof Error ? originalError.message : "האתר חסם את הסריקה הישירה";
    throw new Error(`${first}. Google PageSpeed החזיר שגיאה ולא ניתן היה להשלים דו״ח חלופי`);
  }

  const lighthouse = payload.lighthouseResult;
  if (!lighthouse || lighthouse.runtimeError?.code) {
    throw new Error(lighthouse?.runtimeError?.message || "Google PageSpeed לא הצליח לטעון את האתר");
  }

  const audits = lighthouse.audits || {};
  const seo = score100(lighthouse.categories?.seo?.score, 30);
  const performance = score100(lighthouse.categories?.performance?.score, 30);
  const geo = 25;
  const aeo = 20;
  const overall = Math.round(seo * .35 + geo * .27 + aeo * .25 + performance * .13);
  const finalUrl = lighthouse.finalUrl || payload.id || target.toString();
  const host = new URL(finalUrl).hostname;
  const originalMessage = originalError instanceof Error ? originalError.message : "האתר חסם את הסריקה הישירה";

  const checks: AnalysisCheck[] = [
    check("fallback", "Performance", "אופן הגישה לאתר", 55, 4, `הסריקה הישירה נכשלה: ${originalMessage}. הדו״ח הושלם באמצעות Google Lighthouse.`, "בדקו חומת אש או Bot Protection. בדיקות תוכן ו-GEO/AEO בדו״ח זה מוגבלות."),
    check("psi-http", "SEO", "קוד תגובה ואפשרות טעינה", auditScore(audits, "http-status-code", 50), 10, finding(audits, "http-status-code", "Google הצליח להריץ בדיקת Lighthouse על העמוד."), "ודאו שהעמוד מחזיר HTTP 200 למשתמשים ולסורקי חיפוש."),
    check("psi-crawl", "SEO", "אפשרות סריקה ואינדוקס", auditScore(audits, "is-crawlable", 50), 12, finding(audits, "is-crawlable", "נבדקה אפשרות הסריקה באמצעות Lighthouse."), "ודאו שאין noindex או חסימה של סורקי חיפוש חשובים."),
    check("psi-robots", "SEO", "robots.txt", auditScore(audits, "robots-txt", 50), 8, finding(audits, "robots-txt", "נבדק robots.txt באמצעות Lighthouse."), "תקנו כללים שגויים ב-robots.txt וודאו שהוא מחזיר קוד תקין."),
    check("psi-title", "SEO", "כותרת עמוד", auditScore(audits, "document-title", 50), 10, finding(audits, "document-title", "נבדקה נוכחות title."), "הגדירו title ייחודי, ברור ותיאורי."),
    check("psi-description", "SEO", "תיאור מטא", auditScore(audits, "meta-description", 50), 8, finding(audits, "meta-description", "נבדקה נוכחות meta description."), "הוסיפו תיאור מדויק שמסכם את ערך העמוד."),
    check("psi-canonical", "SEO", "כתובת קנונית", auditScore(audits, "canonical", 50), 8, finding(audits, "canonical", "נבדקה כתובת canonical."), "הגדירו canonical מוחלט ועקבי."),
    check("psi-viewport", "SEO", "התאמה למובייל", auditScore(audits, "viewport", 50), 5, finding(audits, "viewport", "נבדקה תגית viewport."), "הגדירו viewport ובדקו את העמוד במובייל."),
    check("psi-alt", "SEO", "טקסט חלופי לתמונות", auditScore(audits, "image-alt", 50), 5, finding(audits, "image-alt", "נבדקו תיאורי תמונות."), "הוסיפו alt לתמונות משמעותיות."),
    check("psi-links", "AEO", "טקסט קישורים", auditScore(audits, "link-text", 50), 5, finding(audits, "link-text", "נבדק טקסט הקישורים."), "השתמשו בטקסט קישור תיאורי שמסביר לאן הוא מוביל."),
    check("psi-geo-limit", "GEO", "בדיקות ישות ומקורות", 25, 10, "לא ניתן היה לקרוא את HTML המקורי, ולכן Schema, ישויות ומקורות לא נבדקו במלואם.", "אפשרו גישה לסורקי בדיקה או בדקו עמוד שאינו מוגן כדי לקבל דו״ח GEO מלא."),
    check("psi-aeo-limit", "AEO", "בדיקות שאלות ותשובות", 20, 10, "לא ניתן היה לנתח את מבנה התוכן המלא, ולכן שאלות, תשובות ישירות ו-FAQ לא נבדקו במלואם.", "אפשרו גישה לסורקי בדיקה כדי לקבל דו״ח AEO מלא."),
    check("psi-lcp", "Performance", "Largest Contentful Paint", auditScore(audits, "largest-contentful-paint", performance), 12, finding(audits, "largest-contentful-paint", "נמדד LCP באמצעות Lighthouse."), "שפרו את טעינת רכיב התוכן המרכזי."),
    check("psi-cls", "Performance", "Cumulative Layout Shift", auditScore(audits, "cumulative-layout-shift", performance), 8, finding(audits, "cumulative-layout-shift", "נמדדה יציבות הפריסה."), "הגדירו מידות למדיה ושמרו מקום לרכיבים דינמיים."),
    check("psi-tbt", "Performance", "Total Blocking Time", auditScore(audits, "total-blocking-time", performance), 8, finding(audits, "total-blocking-time", "נמדד זמן חסימת התהליך הראשי."), "צמצמו JavaScript כבד ופצלו משימות ארוכות."),
    check("psi-ttfb", "Performance", "זמן תגובת שרת", auditScore(audits, "server-response-time", performance), 10, finding(audits, "server-response-time", "נבדק זמן תגובת השרת."), "השתמשו ב-cache, CDN ושפרו את זמן יצירת העמוד."),
  ];

  return {
    url: target.toString(),
    finalUrl,
    fetchedAt: lighthouse.fetchTime || new Date().toISOString(),
    durationMs: Math.round(lighthouse.timing?.total || (Date.now() - startedAt)),
    persisted: false,
    scores: { overall, seo, geo, aeo, performance },
    response: {
      status: auditScore(audits, "http-status-code", 0) > 0 ? 200 : 0,
      contentType: "application/json; source=pagespeed",
      htmlBytes: 0,
      redirects: finalUrl === target.toString() ? 0 : 1,
      source: "pagespeed",
      limited: true,
    },
    snapshot: {
      title: host,
      description: "",
      canonical: finalUrl,
      robotsMeta: "",
      lang: "",
      dir: "",
      h1: [],
      h2: [],
      wordCount: 0,
      images: 0,
      imagesMissingAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      questionHeadings: 0,
      answerBlocks: 0,
      listCount: 0,
      tableCount: 0,
      schemaTypes: [],
      jsonLdErrors: 0,
      scripts: 0,
      lazyImages: 0,
      sizedImages: 0,
    },
    crawlability: {
      robotsFound: auditScore(audits, "robots-txt", 0) > 0,
      sitemapFound: false,
      sitemapUrl: "",
      llmsTxtFound: false,
      googlebot: auditScore(audits, "is-crawlable", 0) >= 80 ? "allowed" : "unknown",
      oaiSearchBot: "unknown",
      gptBot: "unknown",
    },
    checks,
    contentIdeas: [
      { type: "section", title: "פתיחת גישה לכלי בדיקה", value: "בדקו את כללי חומת האש ו-Bot Protection ואפשרו קריאות GET ציבוריות לעמודים שאמורים להופיע בחיפוש.", reason: "גישה מלאה נדרשת כדי לבדוק Schema, תוכן ו-AEO במדויק." },
      { type: "faq", title: "בדיקת AEO ידנית", value: "מהו השירות?\nלמי הוא מתאים?\nכיצד הוא עובד?\nמה חשוב לבדוק לפני רכישה?", reason: "עד שתתאפשר סריקה מלאה, מומלץ לבדוק ידנית שאלות ותשובות מרכזיות." },
    ],
    topKeywords: [host],
  };
}
