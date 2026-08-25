import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { creditFromOpenverse, searchOpenverse } from '../src/lib/openverse';
import { licensePermissions, mayUseInGame } from '../src/lib/imageCredit';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('רישיונות שאסורים למשחק הזה', () => {
  /**
   * המשחק נמכר במנוי — כל שימוש בו מסחרי. תמונה ברישיון NC בתוכו
   * היא הפרה ישירה, ולא דקדוק.
   */
  it('NC נדחה — המשחק מסחרי', () => {
    expect(licensePermissions('CC BY-NC 4.0').commercial).toBe(false);
    expect(licensePermissions('CC BY-NC-SA 4.0').commercial).toBe(false);
    expect(mayUseInGame({ author: 'A', license: 'CC BY-NC 4.0' })).toBe(false);
  });

  /**
   * המשחק מציג ב-object-fit: cover וחותך לחלקי פאזל — יצירת נגזרת,
   * וזה בדיוק מה ש-ND אוסר.
   */
  it('ND נדחה — המשחק חותך תמונות', () => {
    expect(licensePermissions('CC BY-ND 4.0').derivatives).toBe(false);
    expect(mayUseInGame({ author: 'A', license: 'CC BY-ND 4.0' })).toBe(false);
    expect(mayUseInGame({ author: 'A', license: 'CC BY-NC-ND 4.0' })).toBe(false);
  });

  it('BY ו-BY-SA ו-CC0 מותרים', () => {
    for (const lic of ['CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0', 'CC0']) {
      expect(mayUseInGame({ author: 'A', license: lic }), lic).toBe(true);
    }
  });

  it('נחלת הכלל מותרת', () => {
    expect(licensePermissions('Public Domain')).toEqual({ commercial: true, derivatives: true });
  });

  /** "nd" כחלק ממילה אינו ND — למשל "Standard" */
  it('לא נדחה על צירוף אותיות מקרי', () => {
    expect(licensePermissions('Standard CC BY 4.0').derivatives).toBe(true);
  });
});

describe('קרדיט מ-Openverse', () => {
  it('מרכיב שם רישיון מהקוד ומהגרסה', () => {
    const c = creditFromOpenverse({ creator: 'Someone', license: 'by-sa', license_version: '4.0' })!;
    expect(c.author).toBe('Someone');
    expect(c.license).toBe('CC BY-SA 4.0');
    expect(c.licenseUrl).toBe('https://creativecommons.org/licenses/by-sa/4.0/');
  });

  it('CC0 מקבל שם משלו ולא "CC CC0"', () => {
    expect(creditFromOpenverse({ creator: 'A', license: 'cc0' })!.license).toBe('CC0');
  });

  it('כתובת שהגיעה מה-API מועדפת', () => {
    const c = creditFromOpenverse({ creator: 'A', license: 'by', license_url: 'https://example.org/l' })!;
    expect(c.licenseUrl).toBe('https://example.org/l');
  });

  /** אותו כלל כמו בכל מקום: בלי יוצר או בלי רישיון — אין תמונה */
  it('בלי יוצר או בלי רישיון אין קרדיט', () => {
    expect(creditFromOpenverse({ license: 'by-sa' })).toBeNull();
    expect(creditFromOpenverse({ creator: 'A' })).toBeNull();
    expect(creditFromOpenverse({ creator: '  ', license: 'by' })).toBeNull();
  });
});

describe('הגדרות המקור', () => {
  const src = read('src/lib/openverse.ts');

  /**
   * הסיבה שבגללה נבחר Openverse ולא השלושה הגדולים: הם דורשים
   * מפתח API, ומפתח בחבילת דפדפן אינו סוד. אם מישהו יוסיף כאן
   * מפתח, הכלל של הפרויקט נשבר וגם התנאים של הספק.
   */
  it('אין מפתח API בקוד', () => {
    expect(src).not.toMatch(/api[_-]?key|client[_-]?id|access[_-]?key|Authorization/i);
  });

  it('מסונן בשרת לשימוש מסחרי ולשינוי', () => {
    expect(src).toContain("license_type: 'commercial,modification'");
  });

  /** סינון בשרת אינו מספיק — שער שמישהו אחר מחזיק לו את המפתח */
  it('נבדק שוב אצלנו ולא נסמך על השרת בלבד', () => {
    expect(src).toContain('mayUseInGame');
  });

  it('תוכן למבוגרים מסונן', () => {
    expect(src).toContain("mature: 'false'");
  });

  it('המקור פתוח ב-CSP', () => {
    const csp = read('vercel.json');
    expect(csp).toContain('https://api.openverse.org');
  });
});


/**
 * החיפוש עצמו, מול `fetch` מזויף.
 *
 * מה שנבדק כאן אינו הרשת אלא ההחלטות: איזו תוצאה מתקבלת, איזו
 * נדחית, ומה נכתב בשורת הקרדיט. הסינון בשרת מוצהר בבקשה, אבל
 * ההגנה האמיתית היא שהתשובה נבדקת שוב כאן.
 */
describe('חיפוש תמונה חופשית', () => {
  const row = (over: Record<string, unknown> = {}) => ({
    thumbnail: 'https://cdn.test/pic.jpg',
    creator: 'Ada',
    license: 'by',
    license_version: '4.0',
    foreign_landing_url: 'https://flickr.test/photo/1',
    source: 'flickr',
    ...over
  });

  const respond = (results: unknown[]) =>
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results }) });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('מחזירה תמונה עם קרדיט מלא', async () => {
    vi.stubGlobal('fetch', respond([row()]));
    const hit = await searchOpenverse('חתול');
    expect(hit?.url).toBe('https://cdn.test/pic.jpg');
    expect(hit?.credit.author).toBe('Ada');
    expect(hit?.credit.license).toBe('CC BY 4.0');
    expect(hit?.pageUrl).toBe('https://flickr.test/photo/1');
  });

  /**
   * הרישיון דורש קישור למקור, והמקור אינו "Openverse": Openverse
   * הוא מנוע חיפוש שמצביע על האתר המארח. שם מקור שגוי בשורת
   * הקרדיט הוא ייחוס שגוי.
   */
  it('שם המקור הוא האתר המארח', async () => {
    vi.stubGlobal('fetch', respond([row()]));
    expect((await searchOpenverse('חתול'))?.source).toBe('Flickr');
  });

  it('בלי שדה מקור נופלים לשם השירות', async () => {
    vi.stubGlobal('fetch', respond([row({ source: undefined, provider: undefined })]));
    expect((await searchOpenverse('חתול'))?.source).toBe('Openverse');
  });

  /** NC ו-ND נדחים גם כשהשרת בכל זאת החזיר אותם */
  it('רישיון אסור נדחה אצלנו, ולא נסמכים על סינון השרת', async () => {
    vi.stubGlobal('fetch', respond([row({ license: 'by-nc' }), row({ license: 'by-nd' })]));
    expect(await searchOpenverse('חתול')).toBeNull();
  });

  it('מדלגת על תוצאה פסולה וממשיכה לתקינה', async () => {
    vi.stubGlobal('fetch', respond([row({ creator: '' }), row({ creator: 'Grace' })]));
    expect((await searchOpenverse('חתול'))?.credit.author).toBe('Grace');
  });

  it('תוצאה בלי כתובת תמונה אינה נחשבת', async () => {
    vi.stubGlobal('fetch', respond([row({ thumbnail: undefined, url: undefined })]));
    expect(await searchOpenverse('חתול')).toBeNull();
  });

  /** כישלון רשת אינו שגיאה למשתמש — פשוט אין תמונה */
  it('כישלון רשת מחזיר null בשקט', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await searchOpenverse('חתול')).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await searchOpenverse('חתול')).toBeNull();
  });

  it('מילת חיפוש ריקה אינה יוצאת לרשת בכלל', async () => {
    const f = respond([row()]);
    vi.stubGlobal('fetch', f);
    expect(await searchOpenverse('   ')).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
});
