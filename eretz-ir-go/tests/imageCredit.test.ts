import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MAX_AUTHOR,
  creditFromMetadata,
  creditLine,
  licenseDeedUrl,
  mayDisplay,
  stripHtml
} from '../src/lib/imageCredit';
import { photosAllowed } from '../src/lib/imagePolicy';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/** התשובה של ויקישיתוף מגיעה כך בפועל — היוצר כ-HTML */
const meta = (over: Record<string, unknown> = {}) => ({
  Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Someone" title="User:Someone">Someone</a>' },
  LicenseShortName: { value: 'CC BY-SA 4.0' },
  ...over
});

describe('חילוץ שם היוצר מ-HTML', () => {
  it('מוציא את השם מתוך עוגן', () => {
    expect(creditFromMetadata(meta())?.author).toBe('Someone');
  });

  it('מתמודד עם כמה עוגנים ועם תגיות עיצוב', () => {
    const html = '<a href="#">Alice</a> and <b><a href="#">Bob</a></b>';
    expect(stripHtml(html)).toBe('Alice and Bob');
  });

  it('מפענח ישויות HTML', () => {
    expect(stripHtml('Ben&nbsp;&amp;&nbsp;Jerry')).toBe('Ben & Jerry');
    expect(stripHtml('&lt;script&gt;')).toBe('<script>');
  });

  it('שם ארוך נקצץ ולא שובר את התצוגה', () => {
    const long = { Artist: { value: 'א'.repeat(500) } };
    expect(creditFromMetadata(meta(long))!.author.length).toBeLessThanOrEqual(MAX_AUTHOR);
  });
});

describe('קישור לנוסח הרישיון', () => {
  it('גוזר את הכתובת משם הרישיון', () => {
    expect(licenseDeedUrl('CC BY-SA 4.0')).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
    expect(licenseDeedUrl('CC BY 2.5')).toBe('https://creativecommons.org/licenses/by/2.5/');
    expect(licenseDeedUrl('CC BY-SA 3.0')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
  });

  it('CC0 מקבל את הכתובת הנכונה שלו', () => {
    expect(licenseDeedUrl('CC0')).toContain('publicdomain/zero');
  });

  /** רישיון שלא זוהה עדיין מוצג — פשוט בלי קישור */
  it('רישיון לא מוכר לא מייצר כתובת מומצאת', () => {
    expect(licenseDeedUrl('Public Domain')).toBeUndefined();
    expect(licenseDeedUrl('GFDL')).toBeUndefined();
    expect(licenseDeedUrl('')).toBeUndefined();
  });

  it('כתובת שהגיעה מהמטא־דאטה גוברת על הגזירה', () => {
    const c = creditFromMetadata(meta({ LicenseUrl: { value: 'https://example.org/lic' } }))!;
    expect(c.licenseUrl).toBe('https://example.org/lic');
  });

  it('כתובת שאינה http אינה מתקבלת', () => {
    const c = creditFromMetadata(meta({ LicenseUrl: { value: 'javascript:alert(1)' } }))!;
    expect(c.licenseUrl).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
  });
});

describe('השער — בלי קרדיט אין תמונה', () => {
  /**
   * זו הבדיקה שמחזיקה את כל התיקון. אם מישהו ירכך את התנאי, אפליקציה
   * מסחרית תתחיל שוב להציג תמונות של צלמים בלי לתת עליהן קרדיט.
   */
  it('בלי שם יוצר אין קרדיט', () => {
    expect(creditFromMetadata(meta({ Artist: { value: '' } }))).toBeNull();
    expect(creditFromMetadata(meta({ Artist: undefined }))).toBeNull();
    // HTML שכולו תגיות מתרוקן אחרי הניקוי, וזה אותו דבר כמו ריק
    expect(creditFromMetadata(meta({ Artist: { value: '<span></span>' } }))).toBeNull();
  });

  it('בלי שם רישיון אין קרדיט', () => {
    expect(creditFromMetadata(meta({ LicenseShortName: { value: '' } }))).toBeNull();
    expect(creditFromMetadata(meta({ LicenseShortName: undefined }))).toBeNull();
  });

  it('מטא־דאטה חסרה לגמרי', () => {
    expect(creditFromMetadata(undefined)).toBeNull();
    expect(creditFromMetadata(null)).toBeNull();
    expect(creditFromMetadata({})).toBeNull();
  });

  it('mayDisplay מסכים עם creditFromMetadata', () => {
    expect(mayDisplay(creditFromMetadata(meta()))).toBe(true);
    expect(mayDisplay(null)).toBe(false);
    expect(mayDisplay({ author: '  ', license: 'CC BY 4.0' })).toBe(false);
    expect(mayDisplay({ author: 'A', license: '   ' })).toBe(false);
  });
});

describe('שורת הקרדיט', () => {
  const c = { author: 'Someone', license: 'CC BY-SA 4.0' };

  it('כוללת יוצר ורישיון', () => {
    expect(creditLine(c)).toContain('Someone');
    expect(creditLine(c)).toContain('CC BY-SA 4.0');
  });

  /**
   * CC BY-SA 4.0 מחייב לציין שנעשה שינוי. המשחק מציג ב-object-fit:
   * cover ובחלקי פאזל — שתיהן חיתוך, ולכן זה לא ניסוח מנומס אלא
   * דרישה של הרישיון.
   */
  it('מציינת חיתוך כשהתמונה מוצגת חתוכה', () => {
    expect(creditLine(c, { cropped: true })).toContain('חתוכה');
    expect(creditLine(c, { cropped: false })).not.toContain('חתוכה');
  });

  it('מקור מופיע ראשון כשהוא נמסר', () => {
    expect(creditLine(c, { source: 'ויקישיתוף' }).startsWith('ויקישיתוף')).toBe(true);
  });
});

describe('החיבור לקוד המשחק', () => {
  /** המחרוזת שהתחזתה לקרדיט לא חוזרת */
  it('הטקסט הישן שאינו קרדיט הוסר מהקוד', () => {
    const src = read('src/lib/answerImages.ts') + read('src/lib/knowledge.ts');
    expect(src).not.toContain('הרישיון בעמוד המקור');
    expect(src).not.toContain('ראו רישיון בעמוד הערך');
    expect(src).not.toContain('ראו עמוד המקור בוויקיפדיה');
  });

  /**
   * השער הוא `mayUseInGame` ולא `mayDisplay`: הוא כולל גם את דחיית
   * NC ו-ND, ולא רק את קיום הקרדיט. אם מישהו יחזיר את הצינור
   * לשער החלש יותר, הבדיקה הזו תיפול.
   */
  it('הצינור עובר דרך השער המחמיר ולא עוקף אותו', () => {
    const src = read('src/lib/answerImages.ts');
    expect(src).toContain('mayUseInGame');
    expect(src).not.toMatch(/\bmayDisplay\(/);
  });

  /**
   * סריקה רוחבית ולא נקודתית: היו **שלושה** מקומות נפרדים שבנו
   * `ImageAsset` עם מחרוזת קבועה במקום שם רישיון, ושניים מהם לא
   * נמצאו בחיפוש הראשון. הבדיקה סורקת את כל מי שבונה תמונה
   * ומוודאת שאף אחד לא ממציא רישיון.
   */
  it('אף מקום בקוד לא ממציא שם רישיון', () => {
    const builders = ['src/lib/knowledge.ts', 'src/lib/answerImages.ts', 'src/lib/roundEngine.ts'];
    for (const file of builders) {
      const code = read(file)
        .split('\n')
        .filter((l) => !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'))
        .join('\n');
      expect(code, file).not.toMatch(/license:\s*'ראו/);
      expect(code, file).not.toMatch(/license:\s*'ויקי/);
    }
  });

  /**
   * כל בונה תמונה חייב לדרוש יוצר ורישיון לפני שהוא מייצר
   * `ImageAsset`. זו ההגנה מפני הוספת מסלול רביעי בעתיד.
   */
  it('כל בונה תמונה מתנה את הבנייה בקרדיט', () => {
    const knowledge = read('src/lib/knowledge.ts');
    // seedToItem
    expect(knowledge).toContain("entry.au?.trim() && entry.li?.trim()");
    // userItem
    expect(knowledge).toContain("image.author?.trim() && image.license?.trim()");
  });
});

describe('קטגוריות שאין להביא להן תמונה', () => {
  /**
   * רישיון הצילום מסדיר את זכות היוצר, לא את זכותו של המצולם.
   * "אישיות מפורסמת" הוא בן אדם אמיתי ומזוהה, ואפליקציה מסחרית
   * שמציגה את דמותו נכנסת לחוק הגנת הפרטיות ולזכות הפרסום.
   */
  it('אישיות מפורסמת אינה ברשימת ההיתר', () => {
    expect(photosAllowed('celebrity')).toBe(false);
  });

  it('מקומות, בעלי חיים וחפצים כן', () => {
    for (const id of ['country', 'city', 'israelplace', 'animal', 'plant', 'food', 'inanimate']) {
      expect(photosAllowed(id), id).toBe(true);
    }
  });

  /**
   * רשימת היתר ולא רשימת איסור: קטגוריה חדשה לא מקבלת תמונות עד
   * שמישהו יחשוב עליה. זה הכיוון הבטוח לטעות בו.
   */
  it('קטגוריה שלא נשקלה אינה מקבלת תמונות', () => {
    expect(photosAllowed('boyname')).toBe(false);
    expect(photosAllowed('girlname')).toBe(false);
    expect(photosAllowed('profession')).toBe(false);
    expect(photosAllowed('קטגוריה-חדשה')).toBe(false);
  });

  it('הצינור באמת נועל את זה, ולא רק הרשימה', () => {
    expect(read('src/lib/answerImages.ts')).toContain('PHOTO_FREE_CATEGORIES');
  });
});
