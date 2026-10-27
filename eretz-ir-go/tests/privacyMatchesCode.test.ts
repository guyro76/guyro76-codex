import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const policy = read('public/privacy.html');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(full) ? [full] : [];
  });
}
const files = sourceFiles(join(root, 'src'));
const rel = (f: string) => relative(root, f).replaceAll('\\', '/');

/**
 * מדיניות הפרטיות נבדקת מול מה שהקוד עושה, ולא רק מול עצמה.
 *
 * הבדיקות הקיימות ב-`policy.test.ts` ווידאו שהמדיניות *מכילה* מילים
 * ("IP", "Supabase", "COPPA"). הן לא ווידאו שהיא *מלאה*, וכך גדל פער
 * של חודשים: המדיניות טענה ש"הדבר היחיד שיוצא מהמכשיר" הוא חיפוש
 * בוויקיפדיה, בזמן שהקוד פנה גם ל-Openverse, וטענה שאין קישורים
 * יוצאים בזמן ששבעה כאלה היו במסכי התוצאות והפאזל. שום דבר מזה לא
 * נתפס, כי לאף בדיקה לא הייתה סיבה להשוות.
 */
describe('המדיניות מול הקוד: קובצי Cookie ואחסון', () => {
  it('המשחק לא יוצר אף Cookie', () => {
    const users = files.filter((f) => /document\.cookie/.test(readFileSync(f, 'utf8'))).map(rel);
    expect(users, 'קוד שכותב Cookie — צריך לעדכן את המדיניות ולשקול באנר הסכמה').toEqual([]);
    expect(policy).toContain('אינו יוצר קובצי Cookie');
  });

  /**
   * כל קובץ שנוגע ב-localStorage/sessionStorage ברשימה סגורה. קובץ חדש
   * יפיל את הבדיקה, ומי שיתקן אותה יצטרך לשאול גם אם המפתח החדש מופיע
   * בטבלה במדיניות — וזה כל הענין.
   */
  it('רק הקבצים הידועים נוגעים ב-localStorage וב-sessionStorage', () => {
    const KNOWN = ['src/components/InstallPrompt.tsx', 'src/data/skins.ts', 'src/lib/supabase.ts'];
    const users = files
      .filter((f) => /\b(localStorage|sessionStorage)\b/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))
      .map(rel)
      .sort();
    expect(users).toEqual(KNOWN);
  });

  it('כל מפתח localStorage שהקוד כותב מופיע בטבלה במדיניות', () => {
    const keys = [
      ['src/lib/supabase.ts', /storageKey:\s*'([^']+)'/],
      ['src/lib/supabase.ts', /REMEMBER_KEY\s*=\s*'([^']+)'/],
      ['src/data/skins.ts', /LS_KEY\s*=\s*'([^']+)'/],
      ['src/components/InstallPrompt.tsx', /DISMISSED_KEY\s*=\s*'([^']+)'/]
    ] as const;
    for (const [file, pattern] of keys) {
      const key = read(file).match(pattern)?.[1];
      expect(key, `לא נמצא מפתח ב-${file}`).toBeTruthy();
      expect(policy, `המפתח ${key} (${file}) חסר במדיניות`).toContain(key!);
    }
  });

  it('המדיניות מזכירה את כל מנגנוני האחסון בפועל', () => {
    for (const word of ['IndexedDB', 'localStorage', 'sessionStorage', 'Cache Storage']) {
      expect(policy, `חסר: ${word}`).toContain(word);
    }
  });

  /** ה-Service Worker שומר תשובות חיפוש (עם המילה) ותמונות; משך השמירה כתוב בהגדרות */
  it('משכי השמירה במטמון זהים להגדרות ה-Service Worker', () => {
    const cfg = read('vite.config.ts');
    expect(cfg).toMatch(/maxAgeSeconds:\s*60 \* 60 \* 24 \* 90/);
    expect(cfg).toMatch(/maxAgeSeconds:\s*60 \* 60 \* 24 \* 30/);
    expect(policy).toContain('90 יום');
    expect(policy).toContain('30 יום');
  });
});

describe('המדיניות מול הקוד: שירותים חיצוניים', () => {
  /** כל מקור שהקוד פונה אליו -> המילה שחייבת להופיע במדיניות */
  const OPERATORS: Record<string, string> = {
    'he.wikipedia.org': 'ויקיפדיה',
    'api.openverse.org': 'Openverse'
  };
  const hosts = [
    ...new Set(
      ['src/lib/verifyOnline.ts', 'src/lib/openverse.ts'].flatMap((f) =>
        [...read(f).matchAll(/https:\/\/([a-z0-9.-]+)\//g)].map((m) => m[1])
      )
    )
  ].filter((h) => !h.endsWith('creativecommons.org'));

  it('נמצאו המקורות בקוד', () => {
    expect(hosts.length).toBeGreaterThanOrEqual(2);
  });

  it('לכל מקור שהקוד פונה אליו יש שם במילון, והשם מופיע במדיניות', () => {
    for (const host of hosts) {
      const name = OPERATORS[host];
      expect(name, `מקור חדש ${host} — להוסיף למילון ולמדיניות (סעיפים 3 ו-6)`).toBeTruthy();
      expect(policy, `${host} (${name}) לא מוזכר במדיניות`).toContain(name);
    }
  });

  it('מקורות התמונות מוזכרים כמקבלים של המילה, ולא רק של התשובה', () => {
    expect(policy).toMatch(/Openverse[\s\S]{0,200}אותה מילה/);
    expect(policy).toContain('api.openverse.org');
  });

  it('ספק האחסון מוזכר, יחד עם העובדה שהוא רושם כתובת IP', () => {
    expect(policy).toContain('Vercel');
    expect(policy).toMatch(/ספק האחסון[\s\S]{0,120}IP/);
  });

  it('תוצאות שאין להן קישור חיצוני חשוף: ההצהרה על קישורים מתייחסת לשער הורים', () => {
    expect(policy).toMatch(/קישורים החוצה בלי שער הורים/);
    expect(policy).not.toContain('קישורים יוצאים לתוכן שאינו מבוקר');
  });
});

describe('המדיניות: ציות כללי', () => {
  it('התאריך והגרסה עודכנו', () => {
    expect(policy).toMatch(/עודכן לאחרונה: \d+ ב[א-ת]+ 20\d\d · גרסה \d+\.\d+/);
  });

  it('מציינת כמה זמן נשמרים פרטי החשבון, ואיך מבקשים עיון, תיקון ומחיקה', () => {
    expect(policy).toMatch(/כמה זמן נשמרים פרטי החשבון/);
    expect(policy).toMatch(/לעיין[\s\S]{0,80}לתקן[\s\S]{0,80}למחוק/);
  });

  it('מקשרת להצהרת הנגישות', () => {
    expect(policy).toContain('/accessibility.html');
  });
});

/**
 * במשחק יש **עותק שני** של המדיניות: כרטיס הסיכום במסך "פרטיות ומחיקת
 * מידע". הוא נכתב פעם אחת ולא עודכן — וכשנוספו פרסומות ו-Openverse, העמוד
 * הציבורי תוקן והכרטיס נשאר עם "✅ אין פרסומות ואין מעקב" ועם "הדבר
 * היחיד שיוצא מהמכשיר". בדיקות המדיניות בדקו רק את `public/privacy.html`.
 * הכרטיס נתפס בעין, בצילום מסך, ולא בשום בדיקה.
 */
describe('הסיכום שבתוך האפליקציה זהה במהות למדיניות', () => {
  const screen = read('src/screens/Privacy.tsx').replace(/\/\*[\s\S]*?\*\//g, '');

  it('לא מצהיר שאין פרסומות בלי להגביל לגרסה בתשלום', () => {
    expect(screen).not.toContain('✅ אין פרסומות ואין מעקב');
    expect(screen).toMatch(/בגרסה החינמית מוצגות פרסומות/);
    expect(screen).toMatch(/בגרסה בתשלום אין\s+פרסומות/);
  });

  it('מזכיר את שירותי התמונות, לא רק את ויקיפדיה', () => {
    expect(screen).toContain('Openverse');
    expect(screen).not.toContain('הדבר היחיד שיוצא מהמכשיר');
  });

  /**
   * סריקה כללית: אף טקסט שמוצג למשתמש לא טוען "אין פרסומות" בלי לציין
   * שזה נכון רק לגרסה בתשלום. בדיקות קודמות בדקו קובץ אחד כל אחת.
   */
  it('בשום מסך אין "אין פרסומות" ללא הגבלה לגרסה', () => {
    const offenders: string[] = [];
    for (const file of files) {
      let text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      // הרשימה "מה מקבלים בתשלום" אומרת "בלי פרסומות" ובצדק. מוחרג הבלוק
      // הזה בלבד — לא הקובץ — כדי ש"בלי פרסומות" ברשימת החינם עדיין ייתפס.
      if (file.endsWith('src/data/plans.ts')) {
        text = text.replace(/export const PAID_FEATURES = \[[\s\S]*?\n\];/, '');
      }
      for (const sentence of text.split(/[.\n]/)) {
        if (!/אין פרסומות|ללא פרסומות|בלי פרסומות/.test(sentence)) continue;
        if (/בגרסה|גרסת|בתשלום|המלאה|מנוי/.test(sentence)) continue;
        offenders.push(`${rel(file)}: ${sentence.trim().slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

