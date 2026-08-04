import { db } from '../db/db';
import type { ImageCacheRow } from '../db/db';
import { normalizeHebrew } from './hebrew';
import { isOnline, verifyOnWikipedia } from './verifyOnline';
import type { KnowledgeItem } from '../types';

/**
 * תמונות לתשובות שנחשפו ואושרו.
 *
 * רוב התשובות במשחק מגיעות מהמאגר המובנה, שאינו נושא תמונות (כדי לא
 * להטמיע קבצים מוגני רישיון בקוד). כאן מביאים את התמונה האמיתית פעם
 * אחת מוויקיפדיה העברית — עם קישור לעמוד המקור והקרדיט — ושומרים
 * אותה במטמון מקומי, כך שבפעם הבאה היא תוצג גם בלי אינטרנט.
 *
 * כללי האפיון שנשמרים:
 * - רק תמונות אמיתיות ממקור מזוהה. אין ייצור תמונות ואין מקור אלמוני.
 * - נשלחת רק מילת החיפוש (שם הערך), לא נתוני הילד ולא תשובות אישיות.
 * - חיפוש שנכשל נזכר כ-`found: false` כדי לא להעמיס בקשות בכל משחק.
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

function fromRow(row: ImageCacheRow | undefined): ResolvedImage | null {
  if (!row?.found || !row.url) return null;
  return { url: row.url, pageUrl: row.pageUrl, attribution: row.attribution };
}

/** תמונה שכבר קיימת מקומית — בלי שום בקשת רשת */
export async function cachedAnswerImage(name: string): Promise<ResolvedImage | null> {
  const key = normalizeHebrew(name);
  if (!key) return null;
  return fromRow(await db.imageCache.get(key));
}

/**
 * מחזירה תמונה לתשובה: קודם מהמטמון, ואם אין — מוויקיפדיה (רק כשיש רשת).
 * מחזירה null כשאין תמונה מוכרת; אז פשוט לא מוצגת תמונה.
 */
export async function resolveAnswerImage(name: string): Promise<ResolvedImage | null> {
  const key = normalizeHebrew(name);
  if (!key) return null;

  const cached = await db.imageCache.get(key);
  if (cached) {
    const hit = fromRow(cached);
    if (hit) return hit;
    // "לא נמצא" — מנסים שוב רק אחרי שחלף הזמן
    if (Date.now() - new Date(cached.fetchedAt).getTime() < MISS_TTL_MS) return null;
  }

  if (!isOnline() || !takeBudget()) return null;

  const check = await verifyOnWikipedia(name.trim());
  const row: ImageCacheRow = check.found && check.imageUrl
    ? {
        normalized: key,
        found: true,
        url: check.imageUrl,
        pageUrl: check.source,
        attribution: check.imageAttribution,
        fetchedAt: new Date().toISOString()
      }
    : { normalized: key, found: false, fetchedAt: new Date().toISOString() };

  await db.imageCache.put(row);
  return fromRow(row);
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
