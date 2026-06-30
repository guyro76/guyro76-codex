import { siteDescription, siteName, siteUrl, contactEmail } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const base = siteUrl();
  const body = `# ${siteName}\n\n> ${siteDescription}\n\n${siteName} היא מערכת ישראלית לניתוח אתרים בתחומי SEO, GEO ו-AEO. המערכת בודקת מבנה טכני, תוכן, Schema, נגישות לסורקי חיפוש ו-AI, ומפיקה המלצות מעשיות.\n\n## עמודים מרכזיים\n- ${base}/ - מערכת הניתוח\n- ${base}/about - אודות המערכת והגורם שמאחוריה\n- ${base}/faq - שאלות נפוצות על סריקות, דוחות, אוגי, AI מקומי, פרטיות והרשאות\n- ${base}/privacy - מדיניות פרטיות\n- ${base}/accessibility - הצהרת נגישות\n- ${base}/security - אבטחת מידע ודיווח חולשות\n- ${base}/terms - תנאי שימוש\n\n## עובדות חשובות\n- אורגנו אינה מבטיחה דירוג בגוגל או הופעה במערכות AI.\n- תוצאות הן כלי עזר מקצועי המבוסס על המידע שנגיש בזמן הסריקה.\n- כאשר אתר חוסם קריאה ישירה, ייתכן שימוש במקור חלופי והתוצאה תסומן כמוגבלת.\n- אוגי הוא עוזר מקומי שמכיר את הדוח הפעיל ואת מאגר השאלות הנפוצות.\n- בכל פתיחה חדשה של אוגי השיחה הקודמת מתאפסת.\n- יצירת קשר: ${contactEmail}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
