import { CATEGORIES } from '../data/categories';
import { normalizeHebrew } from './hebrew';
import { getKnowledgeBase, userItem } from './knowledge';
import { db, getSetting, setSetting } from '../db/db';

/**
 * מערכת Content Packs — צריכת חבילות תוכן שנוצרות על ידי
 * eretz-ir-content/build-content-pack.mjs (במאגר content-builder).
 * החבילה מאומתת (checksum), מסוננת (עברית, קטגוריות מוכרות, childSafe)
 * וממוזגת למאגר המקומי. בדיקה אוטומטית לכל היותר פעם ב-24 שעות.
 */

export interface ContentPackItem {
  canonicalName: string;
  categoryIds: string[];
  firstLetter: string;
  source: string;
  language: string;
  childSafe: boolean;
}

export interface ContentPack {
  version: string;
  updatedAt: string;
  itemCount: number;
  items: ContentPackItem[];
  checksum: string;
}

const KNOWN_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const DEFAULT_PACK_URL = import.meta.env.VITE_CONTENT_PACK_URL || 'packs/latest.json';

/** SHA-256 hex — זהה לחישוב בסקריפט הבנייה */
export async function packChecksum(items: ContentPackItem[]): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(items));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** סינון בטיחות: רק ערכים עבריים, בקטגוריות מוכרות, המסומנים childSafe */
export function sanitizePackItems(items: ContentPackItem[]): ContentPackItem[] {
  return items.filter((item) => {
    if (!item.childSafe) return false;
    if (typeof item.canonicalName !== 'string') return false;
    const name = item.canonicalName.trim();
    if (name.length < 2 || name.length > 40) return false;
    if (!/[א-ת]/.test(name)) return false;
    if (!Array.isArray(item.categoryIds) || !item.categoryIds.some((c) => KNOWN_CATEGORY_IDS.has(c))) return false;
    return true;
  });
}

export interface PackApplyResult {
  version: string;
  total: number;
  added: number;
}

/** אימות ומיזוג חבילה למאגר המקומי (טבלת contentItems) */
export async function applyContentPack(pack: ContentPack): Promise<PackApplyResult> {
  const checksum = await packChecksum(pack.items);
  if (checksum !== pack.checksum) {
    throw new Error('החבילה נכשלה בבדיקת תקינות (checksum) — לא הותקנה');
  }
  const clean = sanitizePackItems(pack.items);
  const existing = new Set((await db.contentItems.toArray()).map((r) => `${r.normalized}|${r.categoryId}`));
  let added = 0;
  for (const item of clean) {
    const normalized = normalizeHebrew(item.canonicalName);
    for (const categoryId of item.categoryIds.filter((c) => KNOWN_CATEGORY_IDS.has(c))) {
      const key = `${normalized}|${categoryId}`;
      if (existing.has(key)) continue;
      existing.add(key);
      await db.contentItems.add({
        canonicalName: item.canonicalName.trim(),
        normalized,
        categoryId,
        source: item.source,
        addedAt: new Date().toISOString()
      });
      added++;
    }
  }
  await setSetting('contentPackVersion', pack.version);
  await setSetting('lastPackCheck', new Date().toISOString());
  await loadContentIntoKnowledge();
  return { version: pack.version, total: clean.length, added };
}

/** הורדת חבילה מה-URL המוגדר */
export async function fetchContentPack(url: string = DEFAULT_PACK_URL): Promise<ContentPack> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`השרת החזיר ${res.status}`);
  const pack = (await res.json()) as ContentPack;
  if (!pack.version || !Array.isArray(pack.items) || !pack.checksum) {
    throw new Error('קובץ החבילה אינו בפורמט המוכר');
  }
  return pack;
}

/** טעינת כל התוכן שהותקן אל מנוע הידע שבזיכרון */
export async function loadContentIntoKnowledge(): Promise<void> {
  const kb = getKnowledgeBase();
  const rows = await db.contentItems.toArray();
  kb.addUserItems(
    rows.map((row) => ({
      ...userItem(row.canonicalName, row.categoryId, row.source),
      id: `pack-${row.id}`
    }))
  );
}

/** בדיקת עדכון אוטומטית — לכל היותר פעם ב-24 שעות, רק כשיש רשת */
export async function maybeAutoUpdate(): Promise<PackApplyResult | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  if ((await getSetting('packAutoUpdate')) === '0') return null;
  const last = await getSetting('lastPackCheck');
  if (last && Date.now() - new Date(last).getTime() < 24 * 60 * 60 * 1000) return null;
  await setSetting('lastPackCheck', new Date().toISOString());
  try {
    const pack = await fetchContentPack();
    const current = await getSetting('contentPackVersion');
    if (current === pack.version) return null;
    return await applyContentPack(pack);
  } catch {
    return null; // אין חבילה זמינה — לא מפריעים למשחק
  }
}
