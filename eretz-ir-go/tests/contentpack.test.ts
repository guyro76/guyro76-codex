import { describe, expect, it } from 'vitest';
import { packChecksum, sanitizePackItems, type ContentPackItem } from '../src/lib/contentPack';

const item = (over: Partial<ContentPackItem> = {}): ContentPackItem => ({
  canonicalName: 'לשבור את הקרח',
  categoryIds: ['movie'],
  firstLetter: 'ל',
  source: 'http://www.wikidata.org/entity/Q246283',
  language: 'he',
  childSafe: true,
  ...over
});

describe('Content Packs', () => {
  it('checksum זהה לחישוב של סקריפט הבנייה (SHA-256 על items)', async () => {
    const items = [item()];
    const sum = await packChecksum(items);
    expect(sum).toMatch(/^[0-9a-f]{64}$/);
    // דטרמיניסטי
    expect(await packChecksum(items)).toBe(sum);
    // רגיש לשינוי תוכן
    expect(await packChecksum([item({ canonicalName: 'אחר לגמרי' })])).not.toBe(sum);
  });

  it('סינון: ערך תקין עובר', () => {
    expect(sanitizePackItems([item()])).toHaveLength(1);
  });

  it('סינון: ערך שאינו childSafe נחסם', () => {
    expect(sanitizePackItems([item({ childSafe: false })])).toHaveLength(0);
  });

  it('סינון: ללא עברית נחסם', () => {
    expect(sanitizePackItems([item({ canonicalName: 'English Only' })])).toHaveLength(0);
  });

  it('סינון: קטגוריה לא מוכרת נחסמת', () => {
    expect(sanitizePackItems([item({ categoryIds: ['not-a-category'] })])).toHaveLength(0);
  });

  it('סינון: שם קצר/ארוך מדי נחסם', () => {
    expect(sanitizePackItems([item({ canonicalName: 'א' })])).toHaveLength(0);
    expect(sanitizePackItems([item({ canonicalName: 'א'.repeat(50) })])).toHaveLength(0);
  });
});
