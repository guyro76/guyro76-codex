import { db } from '../db/db';
import type { ImageCacheRow } from '../db/db';
import { CATEGORIES } from '../data/categories';
import { normalizeHebrew } from './hebrew';
import { verifyImageCandidate, type RejectReason } from './imageVerify';
import { fetchImageCandidates, fetchImageCredit, isOnline } from './verifyOnline';
import { mayUseInGame, type ImageCredit } from './imageCredit';
import { PHOTO_FREE_CATEGORIES } from './imagePolicy';
import { searchOpenverse } from './openverse';
import type { KnowledgeItem } from '../types';

/**
 * תמונות לתשובות שנחשפו ואושרו.
 *
 * רוב התשובות במשחק מגיעות מהמאגר המובנה, שאינו נושא תמונות (כדי לא
 * להטמיע קבצים מוגני רישיון בקוד). כאן מביאים את התמונה האמיתית פעם
 * אחת מוויקיפדיה העברית — עם קישור לעמוד המקור והקרדיט — ושומרים
 * אותה במטמון מקומי, כך שבפעם הבאה היא תוצג גם בלי אינטרנט.
 *
 * כל מועמד עובר את שערי `imageVerify.ts` לפני שהוא נשמר. מוטב בלי
 * תמונה מאשר תמונה שגויה: חיפוש חופשי החזיר בעבר עץ עבור "כרוב"
 * ומפה עבור "כלנית".
 *
 * כללי האפיון שנשמרים:
 * - רק תמונות אמיתיות ממקור מזוהה. אין ייצור תמונות ואין מקור אלמוני.
 * - נשלחת רק מילת החיפוש (שם הערך), לא נתוני הילד ולא תשובות אישיות.
 * - חיפוש שנכשל נזכר כדי לא להעמיס בקשות בכל משחק.
 */

/** לכמה זמן זוכרים "לא נמצאה תמונה" לפני ניסיון נוסף */
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * תאריך שממנו והלאה סימוני "לא נמצאה תמונה" נחשבים אמינים.
 *
 * לפני התיקון, כישלון רשת נרשם במטמון בדיוק כמו "חיפשנו ואין תמונה",
 * ונזכר לחודש. די היה בסיבוב אחד ברשת גרועה כדי שהתמונות ייעלמו
 * מהמכשיר — וזה בדיוק מה שדווח. הרשומות השליליות שנוצרו אז מבוטלות
 * כאן פעם אחת, בלי לגעת במבנה מסד הנתונים ובלי למחוק תמונות שנמצאו.
 */
const MISS_EPOCH = Date.parse('2026-08-16T00:00:00Z');

/**
 * תקציב חיפושים חדשים — המשחק הוא Offline First, ולכן לא מציפים את
 * ויקיפדיה בבקשות. תמונות שכבר במטמון מוצגות תמיד, בלי קשר לתקציב.
 *
 * התקציב הועלה אחרי שהתברר שסיבוב עם שמונה קטגוריות, ועוד חלון
 * "מילה חדשה" בסופו, חורג ממנו כבר בסיבוב הראשון — והתמונות
 * האחרונות במסך פשוט לא הופיעו.
 */
const LOOKUP_BUDGET = 16;
const BUDGET_WINDOW_MS = 60_000;
let spent = 0;
let windowStart = 0;

function takeBudget(): boolean {
  const now = Date.now();
  if (now - windowStart > BUDGET_WINDOW_MS) {
    windowStart = now;
    spent = 0;
  }
  if (spent >= LOOKUP_BUDGET) return false;
  spent++;
  return true;
}

export interface ResolvedImage {
  url: string;
  pageUrl?: string;
  /** יוצר, רישיון וקישור לנוסח. תמונה בלי זה אינה מוצגת. */
  credit: ImageCredit;
  /**
   * שם האתר שממנו הגיעה התמונה. שדה חובה ולא ברירת מחדל, כי מאז
   * שנוסף מקור שני אי אפשר להסיק אותו — וייחוס תמונה למקור הלא
   * נכון הוא בדיוק סוג ההפרה שהקרדיט נועד למנוע.
   */
  source: string;
}

/** שם המקור לתמונות שהובאו דרך `fetchImageCandidates` */
const WIKI_SOURCE = 'ויקיפדיה העברית';

/** המפתח כולל את הקטגוריה: "כלנית" בצומח ובשם של בת אינם אותו דבר */
export function imageKey(name: string, categoryId: string): string {
  return `${normalizeHebrew(name)}|${categoryId}`;
}

/**
 * שורת מטמון → תמונה להצגה.
 *
 * **בלי קרדיט מלא אין תמונה.** שורות שנשמרו לפני התיקון נושאות
 * מחרוזת שהתחזתה לקרדיט ולא שם יוצר, ולכן הן נדחות כאן ונשלפות
 * מחדש — עדיף שתמונה תיעלם לסיבוב אחד מאשר שתוצג בלי הקרדיט
 * שהרישיון דורש.
 */
function fromRow(row: ImageCacheRow | undefined): ResolvedImage | null {
  if (!row?.found || !row.url || row.rejectedByUser) return null;
  const credit: ImageCredit | null =
    row.author && row.license
      ? { author: row.author, license: row.license, licenseUrl: row.licenseUrl }
      : null;
  if (!mayUseInGame(credit)) return null;
  // שורות שנשמרו לפני שנוסף המקור השני הגיעו כולן מוויקיפדיה
  return { url: row.url, pageUrl: row.pageUrl, credit, source: row.source ?? WIKI_SOURCE };
}

/** תמונה שכבר קיימת מקומית — בלי שום בקשת רשת */
export async function cachedAnswerImage(name: string, categoryId: string): Promise<ResolvedImage | null> {
  if (!name.trim()) return null;
  return fromRow(await db.imageCache.get(imageKey(name, categoryId)));
}

/**
 * מחזירה תמונה לתשובה: קודם מהמטמון, ואם אין — מוויקיפדיה (רק כשיש רשת),
 * ורק אם המועמד עבר את כל שערי האימות.
 * מחזירה null כשאין תמונה מתאימה; אז פשוט לא מוצגת תמונה.
 */
export async function resolveAnswerImage(name: string, categoryId: string): Promise<ResolvedImage | null> {
  if (!name.trim()) return null;
  const key = imageKey(name, categoryId);

  /**
   * קטגוריות שבהן התשובה היא אדם אמיתי אינן נשלפות כלל — רישיון
   * הצילום אינו מכסה את זכויות האדם שמצולם בו. ראו `imagePolicy.ts`.
   */
  if (!PHOTO_FREE_CATEGORIES.includes(categoryId)) return null;

  const cached = await db.imageCache.get(key);
  if (cached) {
    if (cached.rejectedByUser) return null; // נפסלה ידנית — לא חוזרים אליה
    const hit = fromRow(cached);
    if (hit) return hit;
    const at = new Date(cached.fetchedAt).getTime();
    if (at >= MISS_EPOCH && Date.now() - at < MISS_TTL_MS) return null;
  }

  if (!isOnline() || !takeBudget()) return null;

  const hint = CATEGORIES.find((c) => c.id === categoryId)?.description;
  const candidates = await fetchImageCandidates(name.trim(), hint);
  // הרשת נכשלה — לא יודעים אם יש תמונה, ולכן לא זוכרים כלום.
  // הפעם הבאה תנסה שוב במקום להציג "אין תמונה" לשווא.
  if (candidates === null) return null;

  let lastReason: RejectReason = 'no-image';
  for (const candidate of candidates) {
    const verdict = verifyImageCandidate(name, categoryId, candidate);
    if (verdict.ok && candidate.imageUrl) {
      /**
       * השער האחרון, ולפניו התמונה עוד לא "נמצאה": בלי שם יוצר
       * ורישיון אי אפשר לתת קרדיט שעומד ברישיון, ולכן המועמד נדחה
       * כאילו לא היה. שאילתה נוספת לכל תמונה — זה המחיר.
       */
      const credit = candidate.imageFile ? await fetchImageCredit(candidate.imageFile) : null;
      if (!mayUseInGame(credit)) {
        lastReason = 'no-credit';
        continue;
      }

      const row: ImageCacheRow = {
        key,
        normalized: normalizeHebrew(name),
        categoryId,
        found: true,
        url: candidate.imageUrl,
        pageUrl: candidate.pageUrl,
        author: credit.author,
        license: credit.license,
        licenseUrl: credit.licenseUrl,
        source: WIKI_SOURCE,
        title: candidate.title,
        fetchedAt: new Date().toISOString()
      };
      await db.imageCache.put(row);
      return fromRow(row);
    }
    if (!verdict.ok) lastReason = verdict.reason;
  }

  /**
   * ויקישיתוף לא נתן תמונה עם קרדיט תקין — מנסים מקור חופשי שני.
   *
   * Openverse ולא Unsplash/Pexels/Pixabay: השלושה דורשים מפתח API,
   * ומפתח שנארז לדפדפן אינו סוד. ראו את ההסבר המלא ב-`openverse.ts`.
   * הקרדיט עובר את אותו שער בדיוק, כולל דחיית NC ו-ND.
   */
  const free = await searchOpenverse(name.trim());
  if (free) {
    const row: ImageCacheRow = {
      key,
      normalized: normalizeHebrew(name),
      categoryId,
      found: true,
      url: free.url,
      pageUrl: free.pageUrl,
      author: free.credit.author,
      license: free.credit.license,
      licenseUrl: free.credit.licenseUrl,
      source: free.source,
      title: name.trim(),
      fetchedAt: new Date().toISOString()
    };
    await db.imageCache.put(row);
    return fromRow(row);
  }

  await db.imageCache.put({
    key,
    normalized: normalizeHebrew(name),
    categoryId,
    found: false,
    rejectReason: lastReason,
    fetchedAt: new Date().toISOString()
  });
  return null;
}

/**
 * דיווח של שחקן או הורה שהתמונה לא מתאימה. התמונה נחסמת לצמיתות
 * במכשיר הזה ולא תוצג שוב — שסתום ביטחון אנושי מעל הבדיקה האוטומטית.
 */
export async function reportWrongImage(name: string, categoryId: string): Promise<void> {
  const key = imageKey(name, categoryId);
  const existing = await db.imageCache.get(key);
  await db.imageCache.put({
    key,
    normalized: normalizeHebrew(name),
    categoryId,
    found: false,
    rejectedByUser: true,
    rejectReason: 'reported',
    title: existing?.title,
    fetchedAt: new Date().toISOString()
  });
}

/**
 * מיזוג תמונה שנמצאה אל תוך פריט הידע, בלי לדרוס תמונה קיימת.
 * כשאין פריט ידע כלל (תשובה שאושרה ידנית) נבנה פריט מינימלי רק לתצוגה.
 */
export function withImage(
  item: KnowledgeItem | undefined,
  image: ResolvedImage | null,
  name = ''
): KnowledgeItem | undefined {
  if (!image || item?.image) return item;
  const base: KnowledgeItem = item ?? {
    id: `img-${normalizeHebrew(name)}`,
    canonicalName: name,
    normalizedName: normalizeHebrew(name),
    aliases: [],
    categoryIds: [],
    firstLetter: normalizeHebrew(name).charAt(0),
    popularityScore: 0,
    rarityScore: 0,
    language: 'he',
    sources: [],
    childSafe: true,
    lastVerifiedAt: new Date().toISOString().slice(0, 10)
  };
  return {
    ...base,
    image: {
      url: image.url,
      thumbnailUrl: image.url,
      source: image.source,
      author: image.credit.author,
      license: image.credit.license,
      licenseUrl: image.credit.licenseUrl,
      attributionRequired: true
    },
    sources: image.pageUrl ? [...base.sources, image.pageUrl] : base.sources
  };
}
