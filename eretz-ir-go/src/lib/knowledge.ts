import type { KnowledgeItem } from '../types';
import { normalizeHebrew, spellingVariants } from './hebrew';
import { SEED_ENTRIES, type SeedEntry } from '../data/seed';

/**
 * מנוע הידע המקומי — שכבה 1 של LocalHintEngine.
 * נבנה פעם אחת בזיכרון מ-Seed מאומת + ערכים שאושרו על ידי המשתמשים
 * (נשמרים ב-IndexedDB ומוזרקים דרך addUserItems).
 */

function seedToItem(entry: SeedEntry, idx: number): KnowledgeItem {
  const normalized = normalizeHebrew(entry.n);
  return {
    id: `seed-${idx}`,
    canonicalName: entry.n,
    normalizedName: normalized,
    aliases: (entry.a ?? []).map(normalizeHebrew),
    categoryIds: entry.c,
    firstLetter: normalized.charAt(0),
    description: entry.d,
    facts: entry.f ? [entry.f] : undefined,
    popularityScore: entry.p ?? 50,
    rarityScore: 100 - (entry.p ?? 50),
    language: 'he',
    image: entry.img
      ? {
          url: entry.img,
          thumbnailUrl: entry.img,
          source: 'Wikimedia Commons',
          license: 'ראו עמוד המקור',
          attributionRequired: true
        }
      : undefined,
    sources: entry.s ? [entry.s] : ['seed-curated'],
    childSafe: true,
    lastVerifiedAt: '2026-07-01'
  };
}

export class KnowledgeBase {
  items: KnowledgeItem[] = [];
  /** normalized name/alias -> items */
  private byName = new Map<string, KnowledgeItem[]>();
  /** `${categoryId}|${letter}` -> items */
  private byCategoryLetter = new Map<string, KnowledgeItem[]>();

  constructor(items: KnowledgeItem[]) {
    for (const item of items) this.add(item);
  }

  add(item: KnowledgeItem): void {
    this.items.push(item);
    const keys = new Set<string>([item.normalizedName, ...item.aliases]);
    for (const key of keys) {
      for (const variant of spellingVariants(key)) {
        const list = this.byName.get(variant);
        if (list) list.push(item);
        else this.byName.set(variant, [item]);
      }
    }
    for (const cat of item.categoryIds) {
      const key = `${cat}|${item.firstLetter}`;
      const list = this.byCategoryLetter.get(key);
      if (list) list.push(item);
      else this.byCategoryLetter.set(key, [item]);
    }
  }

  addUserItems(items: KnowledgeItem[]): void {
    for (const item of items) {
      if (!this.byName.get(item.normalizedName)?.some((x) => x.categoryIds.some((c) => item.categoryIds.includes(c)))) {
        this.add(item);
      }
    }
  }

  /** חיפוש מדויק (כולל וריאציות כתיב וכינויים) */
  findExact(normalized: string): KnowledgeItem[] {
    const results = new Set<KnowledgeItem>();
    for (const variant of spellingVariants(normalized)) {
      for (const item of this.byName.get(variant) ?? []) results.add(item);
    }
    return [...results];
  }

  /** כל הפריטים בקטגוריה שמתחילים באות */
  byLetter(categoryId: string, letter: string): KnowledgeItem[] {
    return this.byCategoryLetter.get(`${categoryId}|${letter}`) ?? [];
  }

  inCategory(categoryId: string): KnowledgeItem[] {
    return this.items.filter((item) => item.categoryIds.includes(categoryId));
  }
}

let singleton: KnowledgeBase | null = null;

export function getKnowledgeBase(): KnowledgeBase {
  if (!singleton) {
    singleton = new KnowledgeBase(SEED_ENTRIES.map(seedToItem));
  }
  return singleton;
}

/** בניית פריט ידע מתשובה שאושרה אונליין/על ידי הורה */
export function userItem(
  name: string,
  categoryId: string,
  source: string,
  description?: string
): KnowledgeItem {
  const normalized = normalizeHebrew(name);
  return {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    canonicalName: name.trim(),
    normalizedName: normalized,
    aliases: [],
    categoryIds: [categoryId],
    firstLetter: normalized.charAt(0),
    description,
    popularityScore: 20, // תשובה שלא הייתה במאגר — כנראה נדירה יחסית
    rarityScore: 80,
    language: 'he',
    sources: [source],
    childSafe: true,
    lastVerifiedAt: new Date().toISOString().slice(0, 10)
  };
}
