import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const res = (p: string) => resolve(root, 'android/app/src/main/res', p);

/** קורא רוחב וגובה מכותרת IHDR של PNG */
function pngSize(path: string): { w: number; h: number } {
  const buf = readFileSync(path);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const DENSITIES: Record<string, [number, number]> = {
  mdpi: [48, 108],
  hdpi: [72, 162],
  xhdpi: [96, 216],
  xxhdpi: [144, 324],
  xxxhdpi: [192, 432]
};

/**
 * אפליקציה שמוגשת עם אייקון ברירת המחדל של Capacitor נראית כמו
 * תבנית שלא נגעו בה — וזו הרושם הראשון בחנות.
 */
describe('אייקוני אנדרואיד', () => {
  it('קיימים בכל הצפיפויות ובגדלים הנכונים', () => {
    for (const [density, [launcher, foreground]] of Object.entries(DENSITIES)) {
      for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
        const path = res(`mipmap-${density}/${name}`);
        expect(existsSync(path), `חסר ${density}/${name}`).toBe(true);
        expect(pngSize(path), `${density}/${name}`).toEqual({ w: launcher, h: launcher });
      }
      const fg = res(`mipmap-${density}/ic_launcher_foreground.png`);
      expect(pngSize(fg), `${density} foreground`).toEqual({ w: foreground, h: foreground });
    }
  });

  /**
   * רקע האייקון האדפטיבי הגיע מ-Capacitor בלבן. על לבן הגלובוס הכהה
   * נראה כמו טעות, ובמשגר עגול נוצרת סביבו טבעת לבנה.
   */
  it('רקע האייקון האדפטיבי הוא סגול הלילה של המשחק, לא לבן', () => {
    const xml = readFileSync(res('values/ic_launcher_background.xml'), 'utf8');
    expect(xml).toContain('#1B1035');
    expect(xml).not.toMatch(/#FFFFFF/i);
  });

  /**
   * שכבת החזית חייבת להיות שקופה מסביב לציור, אחרת המשגר מציג
   * ריבוע כהה מרחף על צבע הרקע.
   */
  it('שכבת החזית שקופה בפינות', () => {
    const gen = readFileSync(resolve(root, 'scripts/gen-icons.mjs'), 'utf8');
    expect(gen).toContain('globePixel');
    expect(gen).toContain("inset(foreground, 2 / 3, globePixel)");
    // ולא הציור שכולל רקע כהה
    expect(gen).not.toContain('inset(foreground, 2 / 3, iconPixel)');
  });
});

/**
 * דף חנות ב-Google Play לא נשמר בלי תמונת ראשה, והמידות קבועות.
 */
describe('תמונת הראשה של Play', () => {
  const path = resolve(root, 'public/icons/play-feature-graphic.png');

  it('קיימת במידות שגוגל דורשת', () => {
    expect(existsSync(path)).toBe(true);
    expect(pngSize(path)).toEqual({ w: 1024, h: 500 });
  });

  it('אינה קובץ ריק', () => {
    expect(statSync(path).size).toBeGreaterThan(1000);
  });
});


/**
 * טקסטים לחנות — האורכים נאכפים על ידי Google, לא על ידי הטעם הטוב.
 *
 * תיאור קצר שחורג ב-81 תווים פשוט נדחה בהעלאה, ואז מגלים את זה
 * בשלב הכי מעצבן — מול טופס פתוח בקונסולה. הבדיקה סופרת את הטקסט
 * מהקובץ שממנו באמת מעתיקים.
 */
describe('טקסטים לחנות', () => {
  const listing = readFileSync(resolve(root, 'store/LISTING.md'), 'utf8');

  /** שולף את גוש הקוד שאחרי כותרת מסוימת — משם מעתיקים בפועל */
  const block = (heading: string): string => {
    const m = new RegExp(`## ${heading}[\\s\\S]*?\`\`\`\\n([\\s\\S]*?)\\n\`\`\``).exec(listing);
    expect(m, `לא נמצא גוש הטקסט של "${heading}"`).not.toBeNull();
    return m![1];
  };

  it('שם האפליקציה עד 30 תווים', () => {
    const name = block('שם האפליקציה \\(עד 30 תווים\\)');
    expect(name.length).toBeGreaterThan(0);
    expect(name.length).toBeLessThanOrEqual(30);
  });

  it('התיאור הקצר עד 80 תווים', () => {
    const short = block('תיאור קצר \\(עד 80 תווים\\)');
    expect(short.length).toBeLessThanOrEqual(80);
  });

  it('התיאור המלא עד 4000 תווים', () => {
    const full = block('תיאור מלא \\(עד 4000 תווים\\)');
    expect(full.length).toBeGreaterThan(200);
    expect(full.length).toBeLessThanOrEqual(4000);
  });

  /**
   * ההבטחות בתיאור חייבות להיות נכונות. "בלי פרסומות" בתיאור של
   * אפליקציה שמציגה פרסומות בגרסה החינמית הוא מצג שווא, וגם עילה
   * להסרה מהחנות.
   */
  it('כל אמירה על היעדר פרסומות מוגבלת לגרסה בתשלום', () => {
    const full = block('תיאור מלא \\(עד 4000 תווים\\)');

    // "אין פרסומות" הוא משפט נכון — אבל רק על הגרסה בתשלום.
    // אותו משפט בלי הסייג הוא מצג שווא, ועילה להסרה מהחנות.
    for (const sentence of full.split(/[.\n]/)) {
      if (!/אין פרסומות|ללא פרסומות|בלי פרסומות/.test(sentence)) continue;
      expect(sentence, `"${sentence.trim()}" — הבטחה על היעדר פרסומות בלי לסייג לגרסה בתשלום`).toMatch(
        /בתשלום/
      );
    }

    // ואומר במפורש שבגרסה החינמית כן יש, ושהן אינן מותאמות אישית
    expect(full).toContain('שאינן מותאמות אישית');
  });
});
