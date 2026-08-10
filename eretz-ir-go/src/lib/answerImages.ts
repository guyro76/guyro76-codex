import { db } from '../db/db';
import type { ImageCacheRow } from '../db/db';
import { CATEGORIES } from '../data/categories';
import { normalizeHebrew } from './hebrew';
import { verifyImageCandidate, type RejectReason } from './imageVerify';
import { fetchImageCandidates, isOnline } from './verifyOnline';
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
const MISS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * תקציב חיפושים חדשים — המשחק הוא Offline First, ולכן לא מציפים את
 * ויקיפדיה בבקשות. תמונות שכבר במטמון מוצגות תמיד, בלי קשר לתקציב.
 */
const LOOKUP_BUDGET = 6;
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
  attribution?: string;
}

/** המפתח כולל את הקטגוריה: "כלנית" בצומח ובשם של בת אינם אותו דבר */
export function imageKey(name: string, categoryId: string): string {
  return `${normalizeHebrew(name)}|${categoryId}`;
}

function fromRow(row: ImageCacheRow | undefined): ResolvedImage | null {
  if (!row?.found || !row.url || row.rejectedByUser) return null;
  return { url: row.url, pageUrl: row.pageUrl, attribution: row.attribution };
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

  const cached = await db.imageCache.get(key);
  if (cached) {
    if (cached.rejectedByUser) return null; // נפסלה ידנית — לא חוזרים אליה
    const hit = fromRow(cached);
    if (hit) return hit;
    if (Date.now() - new Date(cached.fetchedAt).getTime() < MISS_TTL_MS) return null;
  }

  if (!isOnline() || !takeBudget()) return null;

  const hint = CATEGORIES.find((c) => c.id === categoryId)?.description;
  const candidates = await fetchImageCandidates(name.trim(), hint);

  let lastReason: RejectReason = 'no-image';
  for (const candidate of candidates) {
    const verdict = verifyImageCandidate(name, categoryId, candidate);
    if (verdict.ok && candidate.imageUrl) {
      const row: ImageCacheRow = {
        key,
        normalized: normalizeHebrew(name),
        categoryId,
        found: true,
        url: candidate.imageUrl,
        pageUrl: candidate.pageUrl,
        attribution: 'ויקיפדיה/ויקישיתוף — הרישיון בעמוד המקור',
        title: candidate.title,
        fetchedAt: new Date().toISOString()
      };
      await db.imageCache.put(row);
      return fromRow(row);
    }
    if (!verdict.ok) lastReason = verdict.reason;
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
      source: 'ויקיפדיה העברית',
      author: image.attribution,
      license: 'ראו רישיון בעמוד הערך',
      attributionRequired: true
    },
    sources: image.pageUrl ? [...base.sources, image.pageUrl] : base.sources
  };
}
