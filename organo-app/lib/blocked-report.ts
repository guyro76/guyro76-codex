import type { AnalysisCheck, AnalysisResult, Category, Priority } from "@/types/analyze";

const priority = (weight: number): Priority => weight >= 10 ? "critical" : weight >= 7 ? "high" : "medium";

function check(id: string, category: Category, title: string, score: number, weight: number, finding: string, recommendation: string): AnalysisCheck {
  return {
    id,
    category,
    title,
    score,
    weight,
    status: score >= 80 ? "pass" : score >= 50 ? "warning" : "fail",
    priority: priority(weight),
    finding,
    recommendation,
  };
}

export function blockedSiteReport(target: URL, errors: unknown[]): AnalysisResult {
  const messages = errors
    .filter((error): error is Error => error instanceof Error)
    .map((error) => error.message)
    .filter(Boolean);
  const evidence = [...new Set(messages)].slice(0, 3).join(" | ");
  const hostname = target.hostname;
  const checks: AnalysisCheck[] = [
    check("blocked-access", "Performance", "גישה חיצונית לאתר", 15, 12, `האתר חסם את כל מקורות הבדיקה החיצוניים של אורגנו.${evidence ? ` פירוט: ${evidence}` : ""}`, "בדקו Cloudflare, Wordfence, ModSecurity, חומת אש או Bot Protection ואפשרו בקשות GET ציבוריות לעמודים המיועדים לחיפוש."),
    check("blocked-http", "SEO", "זמינות לסורקים", 25, 12, "לא ניתן היה לאמת קוד HTTP ותוכן HTML מחוץ לדפדפן רגיל.", "בדקו שהאתר אינו מחזיר 403, 406 או challenge לסורקי Google, Bing וכלי בדיקה לגיטימיים."),
    check("blocked-index", "SEO", "יכולת אינדוקס", 30, 10, "המערכת לא הצליחה לאמת robots, meta robots או canonical.", "בדקו ידנית robots.txt, noindex, canonical ו-Google Search Console."),
    check("blocked-schema", "SEO", "Schema ונתונים מובנים", 20, 8, "לא ניתן היה לקרוא JSON-LD מהעמוד.", "בדקו את העמוד ב-Rich Results Test והוסיפו Schema שתואם לתוכן הגלוי."),
    check("blocked-entity", "GEO", "ישות ומותג", 20, 12, "לא ניתן היה לאמת Organization, LocalBusiness או Person Schema.", "הגדירו ישות מרכזית ברורה עם שם, URL, פרטי קשר ו-sameAs אמיתיים."),
    check("blocked-ai", "GEO", "גישה לסורקי AI", 20, 12, "לא ניתן היה לקרוא robots.txt ולאמת OAI-SearchBot או GPTBot.", "בדקו את כללי robots.txt וחומת האש עבור סורקי AI שבהם ברצונכם לתמוך."),
    check("blocked-evidence", "GEO", "מקורות ואסמכתאות", 20, 8, "תוכן וקישורים חיצוניים לא היו זמינים לבדיקה.", "הציגו מחבר, תאריך עדכון, מקורות ראשוניים ופרטי ישות ברורים."),
    check("blocked-questions", "AEO", "שאלות ותשובות", 20, 12, "לא ניתן היה לנתח כותרות שאלה ותשובות ישירות.", "הוסיפו שאלות אמיתיות כ-H2 או H3 ותשובה ישירה של 2 עד 4 משפטים לאחר כל שאלה."),
    check("blocked-faq", "AEO", "FAQ ומבנה לציטוט", 20, 8, "לא ניתן היה לאמת FAQ גלוי או FAQPage Schema.", "הוסיפו FAQ רק כאשר השאלות והתשובות מוצגות למשתמש ומתאימות להנחיות מנועי החיפוש."),
    check("blocked-performance", "Performance", "ביצועי עמוד", 20, 10, "החסימה מנעה מדידת TTFB, גודל HTML ומדדי טעינה.", "הריצו Lighthouse מתוך Chrome ובדקו Core Web Vitals ב-Search Console."),
  ];

  return {
    url: target.toString(),
    finalUrl: target.toString(),
    fetchedAt: new Date().toISOString(),
    durationMs: 0,
    persisted: false,
    scores: { overall: 22, seo: 24, geo: 20, aeo: 20, performance: 18 },
    response: {
      status: 0,
      contentType: "application/x-organo-blocked-report",
      htmlBytes: 0,
      redirects: 0,
      source: "blocked",
      limited: true,
    },
    snapshot: {
      title: hostname,
      description: "",
      canonical: target.toString(),
      robotsMeta: "unknown",
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
      robotsFound: false,
      sitemapFound: false,
      sitemapUrl: "",
      llmsTxtFound: false,
      googlebot: "unknown",
      oaiSearchBot: "unknown",
      gptBot: "unknown",
    },
    checks,
    contentIdeas: [
      {
        type: "robots",
        title: "בדיקת חסימת סורקים",
        value: "בדקו robots.txt, Cloudflare, Wordfence, ModSecurity וכללי Bot Protection. ודאו שעמודים ציבוריים מחזירים HTTP 200 ללא challenge לסורקים לגיטימיים.",
        reason: "האתר חסם את כל מקורות הבדיקה החיצוניים.",
      },
      {
        type: "faq",
        title: "מבנה AEO לבדיקה ידנית",
        value: "מהו השירות?\nלמי הוא מתאים?\nכיצד הוא עובד?\nמה העלות?\nכיצד יוצרים קשר?",
        reason: "לא ניתן היה לקרוא את תוכן העמוד, ולכן מומלץ להתחיל בבדיקת שאלות מרכזיות ידנית.",
      },
    ],
    topKeywords: [hostname],
  };
}
