import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUZZLES, puzzleById } from '../src/data/puzzles';
import {
  PUZZLE_PHOTOS,
  puzzlePhoto,
  puzzlePhotoCredit,
  puzzlePhotoUrl,
  type PuzzlePhoto
} from '../src/data/puzzlePhotos';

const root = resolve(__dirname, '..');
const ids = new Set(PUZZLES.map((p) => p.id));

/**
 * הטבלה נוצרת אוטומטית ויכולה להיות ריקה — זה מצב תקין, שבו כל
 * הפאזלים משתמשים בצינור החי ובאיור. מה שאסור הוא רשומה **חלקית**:
 * צילום ארוז בלי יוצר, בלי רישיון או בלי קישור למקור. הבדיקות כאן
 * עוסקות בדיוק בזה, ולכן הן שומרות על הכלל גם כשהטבלה עוד ריקה.
 */
describe('צילומי הפאזלים הארוזים', () => {
  it('כל רשומה שייכת לפאזל קיים', () => {
    for (const id of Object.keys(PUZZLE_PHOTOS)) {
      expect(ids.has(id), `אין פאזל בשם ${id}`).toBe(true);
    }
  });

  /**
   * הכלל שאסור לשבור: תמונה בלי מקור מזוהה לא נכנסת לחבילה. בלי
   * הבדיקה הזו מספיק שמישהו יוסיף שורה ביד כדי שיוצג לילד צילום
   * שאיש לא יודע מי צילם ותחת איזה רישיון.
   */
  it('לאף צילום אין ייחוס חסר — יוצר, רישיון וקישור', () => {
    for (const [id, photo] of Object.entries(PUZZLE_PHOTOS)) {
      expect(photo.author.trim(), `${id}: אין יוצר`).not.toBe('');
      expect(photo.license.trim(), `${id}: אין רישיון`).not.toBe('');
      expect(photo.pageUrl, `${id}: הקישור למקור אינו כתובת`).toMatch(/^https:\/\//);
      expect(photo.file, `${id}: שם קובץ לא תקין`).toMatch(/^[a-z0-9-]+\.webp$/);
    }
  });

  it('הקובץ שהטבלה מצביעה עליו באמת קיים בחבילה', () => {
    for (const [id, photo] of Object.entries(PUZZLE_PHOTOS)) {
      const path = resolve(root, 'public/puzzles', photo.file);
      expect(existsSync(path), `${id}: חסר ${photo.file}`).toBe(true);
    }
  });

  /**
   * ב-GitHub Pages האתר יושב תחת תת-נתיב. נתיב מוחלט היה שובר שם את
   * כל התמונות, ולכן הוא נגזר מ-BASE_URL.
   */
  it('הנתיב נגזר מ-BASE_URL ולא מקובע לשורש', () => {
    const photo: PuzzlePhoto = {
      file: 'masada.webp',
      author: 'מישהו',
      license: 'CC BY-SA 4.0',
      pageUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg'
    };
    expect(puzzlePhotoUrl(photo)).toBe(`${import.meta.env.BASE_URL}puzzles/masada.webp`);
    // בבדיקות BASE_URL הוא '/', ולכן הפלט נראה זהה לנתיב מקובע. מה
    // שבאמת מבדיל הוא המקור עצמו: אסור שיהיה בו '/puzzles' כתוב ביד.
    const src = readFileSync(resolve(root, 'src/data/puzzlePhotos.ts'), 'utf8');
    expect(src).toContain('import.meta.env.BASE_URL');
    expect(src).not.toMatch(/['\`]\/puzzles/);
  });

  it('הקרדיט מציג גם את היוצר וגם את הרישיון', () => {
    const credit = puzzlePhotoCredit({
      file: 'x.webp',
      author: 'חגי אגמון-שניר',
      license: 'CC BY-SA 4.0',
      pageUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg'
    });
    expect(credit).toContain('חגי אגמון-שניר');
    expect(credit).toContain('CC BY-SA 4.0');
  });

  it('פאזל בלי צילום ארוז מחזיר undefined ולא זורק', () => {
    expect(puzzlePhoto('no-such-puzzle')).toBeUndefined();
    for (const p of PUZZLES) expect(() => puzzlePhoto(p.id)).not.toThrow();
  });
});

/**
 * הסקריפט הוא המקור היחיד לתמונות הארוזות. אם מישהו יסיר ממנו שער
 * אימות, ייכנסו לחבילה מפות וסמלים במקום צילומים — בדיוק מה שקרה
 * לערך "עכו" כשנבדק מול ה-API האמיתי.
 */
describe('סקריפט האריזה', () => {
  const script = readFileSync(resolve(root, 'scripts/fetch-puzzle-photos.mjs'), 'utf8');

  it('שומר על כל ארבעת שערי האימות', () => {
    expect(script, 'שער הכותרת המדויקת').toContain('page.title !== puzzle.lookup');
    expect(script, 'שער דף הפירושונים').toContain('disambiguation');
    expect(script, 'שער המפה/הסמל').toContain('isBadImageKind');
    expect(script, 'שער הרישיון והקישור').toContain('חסר רישיון או קישור למקור');
    expect(script, 'שער היוצר ברישיונות CC-BY').toContain('חסר יוצר ברישיון');
  });


  /**
   * ההקלה היחידה בשער הייחוס: ביצירה בנחלת הכלל אין דרישה חוקית
   * לקרדיט, ויוצר לא ידוע הוא מצב לגיטימי — המקור עצמו עדיין מזוהה.
   * ברישיון CC-BY לעומת זאת הקרדיט הוא תנאי של הרישיון, ולכן שם
   * תמונה בלי יוצר חייבת להיפסל.
   */
  it('מקל על יוצר חסר רק בנחלת הכלל, ולא ברישיון CC-BY', () => {
    expect(script).toContain('publicDomain');
    const gate = script.slice(script.indexOf('const publicDomain'));
    expect(gate).toMatch(/if \(!publicDomain\)[\s\S]{0,80}throw/);
  });

  it('קורא את רשימת הפאזלים מ-puzzles.ts ולא מחזיק עותק משלו', () => {
    expect(script).toContain("'src/data/puzzles.ts'");
    for (const p of PUZZLES) expect(script).not.toContain(`'${p.name}'`);
  });

  it('מכבד את lookup — אחרת עין גדי ועכו יחזרו תמונות שגויות', () => {
    expect(script).toContain('puzzle.lookup');
    expect(puzzleById('ein-gedi')!.lookup).toBe('נחל דוד');
    expect(puzzleById('akko')!.lookup).toBe('נמל עכו');
  });

  /** ויקימדיה מחזירה 403 לבקשה בלי User-Agent מזהה */
  it('שולח User-Agent מזהה', () => {
    expect(script).toContain("'User-Agent'");
  });
});

/**
 * התהליך כותב לענף שממנו הוא רץ, ולכן לולאה כאן היא לולאה אינסופית
 * שמציפה את ה-CI. ההגנה היחידה עליה היא שרשימת הנתיבים שמפעילה את
 * התהליך לא חופפת לקבצים שהוא עצמו מקמט. הבדיקה נועלת את זה.
 */
describe('תהליך האריזה ב-CI', () => {
  const workflow = readFileSync(
    resolve(root, '..', '.github/workflows/eretz-ir-go-puzzle-photos.yml'),
    'utf8'
  );

  it('הקבצים שהתהליך כותב אינם מפעילים אותו מחדש', () => {
    const paths = [...workflow.matchAll(/^\s+- '([^']+)'$/gm)].map((m) => m[1]);
    const triggers = paths.filter((p) => !p.startsWith('claude/') && p !== 'main');
    expect(triggers.length, 'לא נמצאה רשימת נתיבים').toBeGreaterThan(0);

    const written = ['eretz-ir-go/public/puzzles', 'eretz-ir-go/src/data/puzzlePhotos.ts'];
    for (const w of written) {
      for (const t of triggers) {
        expect(t.startsWith(w), `הקומיט ל-${w} יפעיל מחדש את ${t} — לולאה`).toBe(false);
      }
    }
  });

  it('התהליך מוודא שהתוצאה מתקמפלת לפני שהיא נדחפת', () => {
    expect(workflow).toContain('npx tsc -b');
    expect(workflow).toContain('npm test');
  });
});
