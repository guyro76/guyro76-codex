import { licenseDeedUrl, mayUseInGame, type ImageCredit } from './imageCredit';

/**
 * Openverse — מקור תמונות חופשיות נוסף, אחרי ויקישיתוף.
 *
 * ## למה דווקא Openverse, ולמה לא Unsplash / Pexels / Pixabay
 *
 * שלושת הגדולים **דורשים מפתח API**, ו-Unsplash אף אוסר במפורש
 * שימוש בו מצד לקוח בלי פרוקסי שחותם על הבקשות. מפתח שנארז לתוך
 * חבילת הדפדפן אינו סוד — כל ילד עם "הצג מקור" רואה אותו — ולכן
 * שימוש כזה מפר גם את התנאים שלהם וגם את הכלל של הפרויקט עצמו
 * ("אין לחשוף מפתחות סודיים בקוד צד לקוח"). כדי להשתמש בהם צריך
 * שרת ביניים, וזה בדיוק מה שהמשחק הזה לא רוצה להיות.
 *
 * Openverse מופעל כפרויקט פתוח, **ואינו דורש מפתח**. אסימון קיים
 * להעלאת מכסת הקצב בלבד, לא כדי לפתוח פיצ'רים. הקטלוג שלו מאגד
 * יצירות ברישיון פתוח ובנחלת הכלל.
 *
 * ## מה מסוננן, ולמה
 *
 * הבקשה מבקשת מראש `license_type=commercial,modification`:
 * - **commercial** כי המשחק נמכר במנוי, וכל שימוש בו מסחרי.
 * - **modification** כי המשחק חותך תמונות — `object-fit: cover`
 *   וחלקי פאזל — וזו יצירת נגזרת.
 *
 * הסינון בשרת אינו מספיק ואינו נסמך עליו לבדו: התוצאה עוברת שוב
 * דרך `mayUseInGame` בצד שלנו. שער שנשען על שרת חיצוני הוא שער
 * שמישהו אחר מחזיק לו את המפתח.
 */

/** נקודת הקצה הציבורית. אין מפתח, אין הרשמה. */
const OPENVERSE_API = 'https://api.openverse.org/v1/images/';

/** תקרת זמן לבקשה, כמו בכל פנייה אחרת לרשת במשחק */
const TIMEOUT_MS = 6000;

export interface OpenverseImage {
  url: string;
  pageUrl?: string;
  credit: ImageCredit;
  /**
   * שם האתר שמארח את התמונה — Flickr, NASA וכו'.
   *
   * הרישיון דורש קישור למקור, והמקור אינו "Openverse": Openverse הוא
   * מנוע חיפוש שמצביע על האתר המארח. הצגת שם שגוי היא ייחוס שגוי,
   * ולכן השם נלקח מהשדה שהשירות מדווח ולא נקבע מראש.
   */
  source: string;
}

interface OpenverseResult {
  title?: string;
  url?: string;
  thumbnail?: string;
  creator?: string;
  license?: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url?: string;
  source?: string;
  provider?: string;
}

/**
 * בונה קרדיט משדות Openverse.
 *
 * `license` חוזר כקוד קצר (`by-sa`, `cc0`) ו-`license_version`
 * בנפרד, ולכן השם מורכב כאן — ומגיע לאותה צורה שהמשחק מציג
 * לתמונות מוויקישיתוף, כדי שהתצוגה לא תדע מאיפה הגיעה התמונה.
 */
export function creditFromOpenverse(row: OpenverseResult): ImageCredit | null {
  const author = (row.creator ?? '').trim();
  const code = (row.license ?? '').trim().toLowerCase();
  if (!author || !code) return null;

  const version = (row.license_version ?? '').trim();
  const license = code === 'cc0' ? 'CC0' : `CC ${code.toUpperCase()}${version ? ` ${version}` : ''}`;
  const fromApi = (row.license_url ?? '').trim();

  return {
    author,
    license,
    licenseUrl: fromApi.startsWith('http') ? fromApi : licenseDeedUrl(license)
  };
}

/**
 * שם האתר המארח, לתצוגה בשורת הקרדיט.
 *
 * Openverse מחזיר מזהה טכני (`flickr`, `nasa`), ולכן האות הראשונה
 * מוגדלת. כשאין שדה כזה נופלים ל-"Openverse" — עדיין מקור אמיתי,
 * רק פחות מדויק.
 */
function sourceName(row: OpenverseResult): string {
  const raw = (row.source ?? row.provider ?? '').trim();
  if (!raw) return 'Openverse';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * מחפשת תמונה חופשית אחת.
 *
 * מחזירה `null` בכל מקרה של כישלון או של תוצאה שאינה עומדת בכללים —
 * הקורא מתייחס לזה כאל "אין תמונה", וזו התנהגות תקינה ולא שגיאה.
 */
export async function searchOpenverse(term: string, signal?: AbortSignal): Promise<OpenverseImage | null> {
  const q = term.trim();
  if (!q) return null;

  const params = new URLSearchParams({
    q,
    // מסונן כבר בשרת; נבדק שוב אצלנו
    license_type: 'commercial,modification',
    page_size: '5',
    mature: 'false'
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const relay = () => controller.abort();
  signal?.addEventListener('abort', relay);

  try {
    const res = await fetch(`${OPENVERSE_API}?${params}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: OpenverseResult[] };

    for (const row of data.results ?? []) {
      const src = row.thumbnail ?? row.url;
      if (!src) continue;
      const credit = creditFromOpenverse(row);
      // אותו שער בדיוק כמו לוויקישיתוף — כולל דחיית NC ו-ND
      if (!mayUseInGame(credit)) continue;
      return {
        url: src,
        pageUrl: row.foreign_landing_url,
        credit,
        source: sourceName(row)
      };
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', relay);
  }
}
