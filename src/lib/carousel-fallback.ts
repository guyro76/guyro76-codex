// Free, no-cost carousel generator. Produces a well-structured 7-slide
// Hebrew carousel from the user's inputs WITHOUT any paid AI API. Used as the
// default generator so carousel creation always works at zero cost; if a real
// Anthropic key is configured the route uses Claude instead for richer copy.

interface CarouselInput {
  topic: string;
  platform: string;
  objective: string;
  audience: string;
  tone: string;
}

export interface FallbackSlide {
  headline: string;
  body: string;
  imageQuery: string;
}

function ctaForObjective(objective: string, topic: string): string {
  const map: Record<string, string> = {
    awareness: `רוצים לראות עוד תוכן על ${topic}? עקבו, שמרו את הפוסט ושתפו עם מי שצריך את זה.`,
    engagement: `מה הדבר הכי מאתגר עבורכם ב${topic}? כתבו בתגובות — אני קורא ומגיב לכולם 👇`,
    leads: `רוצים ליווי אישי ב${topic}? שלחו לי הודעה "מעוניין" ונתחיל מכאן.`,
    sales: `מוכנים לקחת את ${topic} לשלב הבא? לחצו על הקישור בביו והצטרפו עוד היום.`,
    authority: `שמרו את הפוסט להמשך, ועקבו לעוד תובנות פרקטיות על ${topic} כל שבוע.`,
  };
  return (
    map[objective] ||
    `אהבתם? עשו שמירה ושיתוף, וכתבו בתגובות מה האתגר הכי גדול שלכם ב${topic}.`
  );
}

export function generateCarouselFallback(input: CarouselInput): {
  slides: FallbackSlide[];
} {
  const topic = (input.topic || "הנושא שלך").trim();
  const audience = (input.audience || "הקהל שלכם").trim();

  const slides: FallbackSlide[] = [
    {
      headline: topic,
      body: `כל מה שחשוב לדעת על ${topic} — מקובץ למדריך אחד, ברור ומעשי. שמרו את הפוסט כדי לחזור אליו 👇`,
      imageQuery: `${topic}`,
    },
    {
      headline: "למה זה חשוב",
      body: `${topic} משפיע ישירות על התוצאות שלכם. כשמבינים את התמונה המלאה, קל יותר לקבל החלטות נכונות, לחסוך זמן ולהימנע מטעויות יקרות.`,
      imageQuery: `${topic} strategy concept`,
    },
    {
      headline: "הטעות הנפוצה",
      body: `רובם ניגשים ל${topic} בלי תוכנית ברורה — ואז מתפזרים. מיקוד הוא ההבדל בין רעש לבין השפעה אמיתית.`,
      imageQuery: `focus planning idea`,
    },
    {
      headline: "הצעד הראשון",
      body: `התחילו בקטן: בחרו פעולה אחת שאפשר ליישם כבר היום בנושא ${topic}. עקביות מנצחת מושלמות — בכל פעם מחדש.`,
      imageQuery: `first step growth path`,
    },
    {
      headline: "מה שמזיז את המחט",
      body: `דברו אל ${audience} בשפה שלהם: פתחו ב-hook חזק, תנו ערך אמיתי, וסיימו בקריאה ברורה לפעולה. ככה תוכן הופך למעורבות.`,
      imageQuery: `engagement audience social`,
    },
    {
      headline: "איך מודדים הצלחה",
      body: `אל תנחשו — מדדו. עקבו אחרי שמירות, שיתופים ותגובות, ולמדו מה באמת עובד. הנתונים יראו לכם לאן להמשיך.`,
      imageQuery: `analytics chart results`,
    },
    {
      headline: "תורכם 🚀",
      body: ctaForObjective(input.objective, topic),
      imageQuery: `call to action motivation`,
    },
  ];

  return { slides };
}
