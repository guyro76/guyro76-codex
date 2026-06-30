import { NextRequest, NextResponse } from "next/server";
import type { GenerateRequest } from "@/types/analyze";

export const runtime = "nodejs";
export const maxDuration = 30;

function fallback(data: GenerateRequest): string {
  const topic = data.keyword.trim() || data.analysis?.topKeywords?.slice(0, 3).join(" ") || "הנושא המרכזי";
  const audience = data.audience.trim() || "לקוחות שמתעניינים בנושא";
  const brand = data.analysis?.snapshot.title?.split(/[|\-–]/)[0].trim() || "המותג";
  switch (data.type) {
    case "meta":
      return `TITLE\n${topic} - מדריך מקצועי ופתרונות | ${brand}\n\nMETA DESCRIPTION\nמידע ברור ומעשי על ${topic}, כולל תשובות לשאלות נפוצות, אפשרויות לבחירה וטיפים שיעזרו ל${audience} לקבל החלטה מבוססת.`;
    case "faq":
      return `## מהו ${topic}?\n${topic} הוא תחום שכדאי להבין באמצעות הגדרה ברורה, דוגמאות ומידע עדכני. בעמוד מומלץ להסביר תחילה את העיקר ולאחר מכן להרחיב.\n\n## למי זה מתאים?\nהפתרון מתאים בעיקר ל${audience}, בהתאם לצורך, לתקציב ולתוצאה הרצויה.\n\n## איך בוחרים נכון?\nמשווים בין חלופות לפי איכות, אמינות, שקיפות, ניסיון, עלות ותמיכה. כדאי לבדוק גם מקורות חיצוניים ולא להסתמך על הבטחה אחת.\n\n## מה חשוב לבדוק לפני שמתחילים?\nיש להגדיר יעד, לאסוף נתונים בסיסיים, לבדוק מגבלות ולבחור מדדי הצלחה שניתן למדוד לאורך זמן.\n\n## מתי רואים תוצאות?\nמשך הזמן משתנה לפי נקודת הפתיחה, התחרות והיקף העבודה. מומלץ לפרסם טווחים מציאותיים ולהסביר אילו גורמים משפיעים עליהם.`;
    case "hero":
      return `# ${topic} שעובד עבור ${audience}\n\n${brand} מרכז עבורכם מידע ברור, פתרונות מעשיים ותשובות מבוססות, כדי שתוכלו להבין את האפשרויות ולבחור נכון.\n\nCTA: לקבלת מידע מותאם`;
    case "about":
      return `## מי עומד מאחורי ${brand}?\n${brand} מספק מידע ושירותים בתחום ${topic} עבור ${audience}. אנו מקפידים על שקיפות, מידע מעודכן, הסבר בגובה העיניים והצגת מקורות כאשר הם רלוונטיים.\n\nמומלץ להוסיף כאן: שם מלא או שם חברה, ניסיון מקצועי, תחומי התמחות, כתובת, טלפון, דוא״ל, פרופילים רשמיים ותאריך עדכון.`;
    case "schema":
      return JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${data.analysis?.finalUrl || "https://example.com"}#organization`,
            name: brand,
            url: data.analysis?.finalUrl || "https://example.com",
            sameAs: []
          },
          {
            "@type": "WebPage",
            "@id": `${data.analysis?.finalUrl || "https://example.com"}#webpage`,
            url: data.analysis?.finalUrl || "https://example.com",
            name: topic,
            about: { "@id": `${data.analysis?.finalUrl || "https://example.com"}#organization` }
          }
        ]
      }, null, 2);
    case "article":
    default:
      return `# ${topic}: המדריך המעשי ל${audience}\n\n## תשובה קצרה\n${topic} דורש שילוב בין הבנת הצורך, בחינת אפשרויות ובדיקה של מידע אמין. התחילו מהגדרת היעד, עברו להשוואה מסודרת וסיימו בתוכנית פעולה מדידה.\n\n## מה חשוב לדעת?\n- הגדירו במדויק מה אתם מנסים להשיג.\n- אספו נתונים ומקורות לפני קבלת החלטה.\n- השוו חלופות לפי קריטריונים קבועים.\n- תעדו תוצאות ועדכנו את התוכן כשהמידע משתנה.\n\n## טעויות נפוצות\nהימנעו מהבטחות כלליות, תוכן משוכפל, נתונים ללא מקור ומאמרים ארוכים שאינם עונים על שאלת המשתמש.\n\n## צעדים מומלצים\n1. הגדירו קהל ומטרה.\n2. בנו מבנה שאלות ותשובות.\n3. הוסיפו דוגמאות ומקורות.\n4. הוסיפו נתונים מובנים מתאימים.\n5. מדדו ביצועים ושפרו לאורך זמן.`;
  }
}

function extractOutputText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const texts: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content.text === "string") texts.push(content.text);
    }
  }
  return texts.join("\n").trim();
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as GenerateRequest;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ text: fallback(data), mode: "template" });

    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const context = data.analysis ? {
      url: data.analysis.finalUrl,
      title: data.analysis.snapshot.title,
      description: data.analysis.snapshot.description,
      scores: data.analysis.scores,
      keywords: data.analysis.topKeywords,
      failedChecks: data.analysis.checks.filter((item) => item.status !== "pass").slice(0, 10).map((item) => ({ title: item.title, finding: item.finding, recommendation: item.recommendation })),
    } : null;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "low" },
        instructions: "You are Organo, an expert SEO, GEO and AEO content strategist. Write accurate, useful, people-first content. Do not invent facts, statistics, credentials or guarantees. Use the requested language and return only the finished content.",
        input: JSON.stringify({ request: data, context }),
      }),
    });
    if (!response.ok) return NextResponse.json({ text: fallback(data), mode: "template", warning: "AI provider unavailable" });
    const payload = await response.json();
    const text = extractOutputText(payload) || fallback(data);
    return NextResponse.json({ text, mode: "ai" });
  } catch {
    return NextResponse.json({ error: "לא ניתן היה ליצור תוכן" }, { status: 400 });
  }
}
