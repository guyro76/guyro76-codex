import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { userItem } from '../src/lib/knowledge';
import { sanitizePackItems, type ContentPack } from '../src/lib/contentPack';
import { withImage } from '../src/lib/answerImages';

describe('תמונות של תשובות מאומתות', () => {
  it('שומרת תמונה עם מקור וקרדיט כשהאימות החזיר כתובת', () => {
    const item = userItem('ונואטו', 'country', 'https://he.wikipedia.org/wiki/ונואטו', 'מדינה באוקיינוס השקט', {
      url: 'https://upload.wikimedia.org/x/vanuatu.jpg',
      attribution: 'ויקיפדיה/ויקישיתוף — הרישיון בעמוד המקור'
    });
    expect(item.image?.url).toBe('https://upload.wikimedia.org/x/vanuatu.jpg');
    expect(item.image?.thumbnailUrl).toBe('https://upload.wikimedia.org/x/vanuatu.jpg');
    expect(item.image?.source).toContain('he.wikipedia.org');
    expect(item.image?.attributionRequired).toBe(true);
  });

  it('לא יוצרת תמונה כשלא הוחזרה כתובת — אין תמונות ממקור לא ידוע', () => {
    expect(userItem('ונואטו', 'country', 'src').image).toBeUndefined();
    expect(userItem('ונואטו', 'country', 'src', undefined, { url: '' }).image).toBeUndefined();
  });
});

describe('חבילת התוכן שנשלחת עם האתר', () => {
  const pack = JSON.parse(readFileSync(new URL('../public/packs/latest.json', import.meta.url), 'utf8')) as ContentPack;

  it('קיימת ובפורמט התקין — כדי שלא תהיה שגיאת 404 בעלייה', () => {
    expect(pack.version).toBeTruthy();
    expect(Array.isArray(pack.items)).toBe(true);
  });

  it('ה-checksum שלה תואם לתוכן', () => {
    const digest = createHash('sha256').update(JSON.stringify(pack.items)).digest('hex');
    expect(digest).toBe(pack.checksum);
  });

  it('כל הערכים שבה עוברים את סינון הבטיחות', () => {
    expect(sanitizePackItems(pack.items)).toHaveLength(pack.items.length);
  });
});

describe('מיזוג תמונה לפריט ידע', () => {
  it('לא דורסת תמונה שכבר קיימת', () => {
    const item = userItem('פריז', 'city', 'seed', undefined, { url: 'https://a/first.jpg' });
    const merged = withImage(item, { url: 'https://b/second.jpg' });
    expect(merged?.image?.url).toBe('https://a/first.jpg');
  });

  it('מוסיפה תמונה לערך מהמאגר המובנה, עם קרדיט וקישור למקור', () => {
    const item = userItem('פריז', 'city', 'seed');
    const merged = withImage(item, { url: 'https://b/paris.jpg', pageUrl: 'https://he.wikipedia.org/wiki/פריז' });
    expect(merged?.image?.url).toBe('https://b/paris.jpg');
    expect(merged?.image?.attributionRequired).toBe(true);
    expect(merged?.sources).toContain('https://he.wikipedia.org/wiki/פריז');
  });

  it('בלי תמונה — הפריט חוזר כמו שהוא, ולא מוצג כלום', () => {
    const item = userItem('פריז', 'city', 'seed');
    expect(withImage(item, null)?.image).toBeUndefined();
    expect(withImage(undefined, null)).toBeUndefined();
  });
});
