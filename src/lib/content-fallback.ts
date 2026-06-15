// Free, no-cost generators for single-image POSTS and multi-slide
// PRESENTATIONS — the same zero-cost philosophy as the carousel generator.
// These always work without any paid AI API so creation never fails.

interface ContentInput {
  topic: string;
  platform: string;
  objective: string;
  audience: string;
  tone: string;
}

export interface ContentSlide {
  headline: string;
  body: string;
  imageQuery: string;
}

function ctaForObjective(objective: string, topic: string): string {
  const map: Record<string, string> = {
    awareness: `רוצים עוד תוכן על ${topic}? עקבו, שמרו ושתפו 👇`,
    engagement: `מה האתגר הכי גדול שלכם ב${topic}? ספרו בתגובות 👇`,
    leads: `רוצים ליווי אישי ב${topic}? שלחו לי "מעוניין" בהודעה.`,
    sales: `מוכנים לקחת את ${topic} לשלב הבא? הקישור בביו 👆`,
    authority: `שמרו את הפוסט ועקבו לעוד תובנות על ${topic} כל שבוע.`,
  };
  return (
    map[objective] ||
    `אהבתם? שמרו, שתפו וכתבו בתגובות מה האתגר שלכם ב${topic}.`
  );
}

/**
 * A single-graphic POST: one strong hook slide plus a value-packed caption
 * built into the body, ready to publish straight to the feed.
 */
export function generatePostFallback(input: ContentInput): {
  slides: ContentSlide[];
} {
  const topic = (input.topic || "הנושא שלך").trim();
  const audience = (input.audience || "הקהל שלכם").trim();

  const body =
    `${topic} בלי בלבול: 3 דברים שחשוב לזכור.\n\n` +
    `1) התחילו בצעד אחד קטן שאפשר ליישם כבר היום.\n` +
    `2) דברו אל ${audience} בשפה שלהם — ערך לפני מכירה.\n` +
    `3) מדדו מה עובד ושפרו בכל פעם מחדש.\n\n` +
    ctaForObjective(input.objective, topic);

  return {
    slides: [
      {
        headline: topic,
        body,
        imageQuery: `${topic}`,
      },
    ],
  };
}

/**
 * A multi-slide PRESENTATION (10 slides): title → agenda → 5 key points →
 * recap → CTA → closing. Landscape 16:9, ideal for LinkedIn / webinars.
 */
export function generatePresentationFallback(input: ContentInput): {
  slides: ContentSlide[];
} {
  const topic = (input.topic || "הנושא שלך").trim();
  const audience = (input.audience || "הקהל שלכם").trim();

  const slides: ContentSlide[] = [
    {
      headline: topic,
      body: `מדריך מעשי ל${topic} — הכל במצגת אחת, ברורה ומסודרת.`,
      imageQuery: `${topic}`,
    },
    {
      headline: "סדר היום",
      body: `מה נכסה: למה זה חשוב, הטעויות הנפוצות, התהליך צעד-אחר-צעד, ואיך מודדים הצלחה ב${topic}.`,
      imageQuery: `agenda plan list`,
    },
    {
      headline: "למה זה חשוב",
      body: `${topic} משפיע ישירות על התוצאות שלכם. הבנה נכונה חוסכת זמן, כסף וטעויות יקרות.`,
      imageQuery: `${topic} importance concept`,
    },
    {
      headline: "הטעות הנפוצה",
      body: `רובם ניגשים ל${topic} בלי תוכנית ומתפזרים. מיקוד הוא ההבדל בין רעש להשפעה.`,
      imageQuery: `mistake focus planning`,
    },
    {
      headline: "התהליך — צעד 1",
      body: `מיפוי: הגדירו מטרה אחת ברורה ל${topic} ואת הקהל המדויק — ${audience}.`,
      imageQuery: `strategy mapping target`,
    },
    {
      headline: "התהליך — צעד 2",
      body: `יישום: בחרו פעולה אחת שאפשר להתחיל כבר היום. עקביות מנצחת מושלמות.`,
      imageQuery: `execution action steps`,
    },
    {
      headline: "התהליך — צעד 3",
      body: `שיפור: בדקו מה עבד, חזרו על מה שמצליח והסירו את מה שלא — בכל מחזור מחדש.`,
      imageQuery: `improvement growth cycle`,
    },
    {
      headline: "איך מודדים הצלחה",
      body: `אל תנחשו — מדדו. עקבו אחרי שמירות, שיתופים ותגובות, והנתונים יראו לאן להמשיך.`,
      imageQuery: `analytics chart results`,
    },
    {
      headline: "סיכום",
      body: `${topic} בשלושה צעדים: מיפוי, יישום, שיפור. התחילו קטן, מדדו, והתמידו.`,
      imageQuery: `summary recap key points`,
    },
    {
      headline: "תורכם 🚀",
      body: ctaForObjective(input.objective, topic),
      imageQuery: `call to action motivation`,
    },
  ];

  return { slides };
}
