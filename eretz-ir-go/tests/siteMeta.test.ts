import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const html = read('index.html');
const publicPages = ['privacy', 'terms', 'support', 'delete-account', 'accessibility'];

describe('מטא-דאטה של האתר', () => {
  it('שפה וכיוון על ה-HTML', () => {
    expect(html).toMatch(/<html[^>]*lang="he"[^>]*dir="rtl"/);
  });

  it('תיאור וכותרת', () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]{30,}"/);
  });

  /** בלי תגים אלה קישור למשחק בוואטסאפ מוצג כשורת טקסט חשופה; הסורקים לא מריצים JS */
  it('תגי שיתוף סטטיים', () => {
    for (const tag of ['og:title', 'og:description', 'og:image', 'og:type', 'og:locale']) {
      expect(html, `חסר ${tag}`).toContain(`property="${tag}"`);
    }
    expect(html).toMatch(/og:image" content="https:\/\//);
  });

  it('הודעה למי ש-JavaScript כבוי אצלו', () => {
    expect(html).toMatch(/<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
  });

  it('robots.txt קיים ופותח את האתר לסריקה, כולל המדיניות', () => {
    expect(existsSync(resolve(root, 'public/robots.txt'))).toBe(true);
    const robots = read('public/robots.txt');
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
  });
});

describe('עמודי המדיניות הציבוריים', () => {
  for (const page of publicPages) {
    it(`${page}.html: קיים, בעברית, עם כותרת, תיאור וחזרה למשחק`, () => {
      const t = read(`public/${page}.html`);
      expect(t).toContain('lang="he"');
      expect(t).toContain('dir="rtl"');
      expect(t).toMatch(/<title>[^<]+<\/title>/);
      expect(t).toMatch(/<meta\s+name="description"/);
      expect(t).toContain('<h1>');
      expect(t).toMatch(/href="\/">/);
    });
  }

  /** עמודים סטטיים רצים תחת ה-CSP: סקריפט inline היה נחסם, וקובץ חיצוני לא מותר */
  it('אף עמוד ציבורי לא טוען סקריפט או משאב מצד שלישי', () => {
    for (const page of publicPages) {
      const t = read(`public/${page}.html`);
      expect(t, `${page}: <script>`).not.toMatch(/<script\b/i);
      expect(t, `${page}: משאב חיצוני`).not.toMatch(/(src|href)="https?:\/\/[^"]+\.(js|css|woff2?|png|jpe?g|svg)"/i);
    }
  });

  it('כל עמוד מקשר חזרה למדיניות, והמדיניות מקשרת לכל השאר', () => {
    const privacy = read('public/privacy.html');
    for (const page of ['terms', 'support', 'delete-account', 'accessibility']) {
      expect(privacy, `privacy.html לא מקשר ל-${page}`).toContain(`/${page}.html`);
      expect(read(`public/${page}.html`), `${page}.html לא מקשר למדיניות`).toContain('/privacy.html');
    }
  });
});
