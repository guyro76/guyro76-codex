import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? tsxFiles(full) : full.endsWith('.tsx') ? [full] : [];
  });
}

/**
 * אף קישור שיוצא מהמשחק לא נכתב ישירות.
 *
 * מדיניות הפרטיות מבטיחה שילד לא יכול לצאת מהמשחק לאתר חיצוני בלי
 * מבוגר, ו-Google Play Families דורשת את זה. ההבטחה הזו נשברת בשקט:
 * מי שמוסיף `<a href={url} target="_blank">` חדש לא יקבל שום שגיאה.
 * הבדיקה הזו נכשלת עליו.
 *
 * קישור לדף של המשחק עצמו (`/privacy.html`) מותר — הוא לא יוצא.
 */
describe('קישורים חיצוניים', () => {
  const files = tsxFiles(join(root, 'src'));

  it('נסרקו קבצים', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it('כל <a target="_blank"> מוביל לדף של המשחק, או שעובר דרך GatedLink', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (file.endsWith('GatedLink.tsx')) continue; // הרכיב עצמו הוא המקום היחיד
      const src = readFileSync(file, 'utf8');
      for (const tag of src.match(/<a\b[^>]*>/gs) ?? []) {
        if (!/target=["'{]_?blank/.test(tag) && !/target="_blank"/.test(tag)) continue;
        const href = tag.match(/href=(?:"([^"]*)"|\{([^}]*)\})/);
        const literal = href?.[1];
        // רק מחרוזת מילולית שמתחילה ב-/ נחשבת לדף של המשחק
        if (!(literal && literal.startsWith('/') && !literal.startsWith('//'))) {
          offenders.push(`${relative(root, file)}: ${tag.replace(/\s+/g, ' ').slice(0, 90)}`);
        }
      }
    }
    expect(offenders, `קישור חיצוני בלי שער הורים:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('אין window.open ואין ניווט ישיר החוצה', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (file.endsWith('GatedLink.tsx')) continue;
      const src = readFileSync(file, 'utf8');
      if (/window\.open\(/.test(src)) offenders.push(relative(root, file));
    }
    expect(offenders).toEqual([]);
  });

  it('GatedLink עוצר את הלחיצה ומציג את שער ההורים', () => {
    const src = readFileSync(join(root, 'src/components/GatedLink.tsx'), 'utf8');
    expect(src).toContain('preventDefault');
    expect(src).toContain('ParentGate');
    // לחיצה אמצעית עוקפת onClick, ולכן נעצרת גם היא
    expect(src).toContain('onAuxClick');
  });
});
