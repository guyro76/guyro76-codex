import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pickHintTarget } from '../src/lib/artzi';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { GAME_LETTERS } from '../src/lib/hebrew';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/**
 * מה קורה כשלארצי אין מילה לצירוף של אות וקטגוריה.
 *
 * במאגר יש 511 חורים כאלה, כולם בקטגוריות המורחבות, ובנוסף **כל**
 * קטגוריה שהילד המציא בעצמו היא חור שלם: המזהה שלה הוא
 * `custom-<timestamp>`, ולכן אין לה אף רשומת seed. מילות הפתיחה
 * שהילד הקליד נשמרות במילון האישי — לא במנוע הידע.
 *
 * זה היה שקט לגמרי: לחיצה על "רמז" לא הציגה כלום, ולחיצה על
 * "קנו תשובה" גבתה מהארנק ולא נתנה תשובה.
 */
describe('צירוף של אות וקטגוריה שאין לו מילה', () => {
  const kb = getKnowledgeBase();
  const none = new Set<string>();

  it('בקטגוריה שהילד המציא אין לארצי שום מילה', () => {
    // מזהה בדיוק בפורמט ש-CategoryCreate מייצר
    const customId = `custom-${Date.now()}`;
    for (const letter of ['א', 'ב', 'מ', 'ש']) {
      expect(pickHintTarget(kb, customId, letter, none)).toBeNull();
    }
  });

  it('גם בקטגוריה רגילה יש אותיות בלי מילה', () => {
    // "חיית ים" באות ג' — חור אמיתי שלא נמצאה לו מילה עברית ברורה
    expect(pickHintTarget(kb, 'seaanimal', 'ג', none)).toBeNull();
  });

  /**
   * החבילה "מורחב (12)" היא הראשונה שבה הילד פוגש קטגוריות
   * לא־קלאסיות, ולכן היא הגבול שבו כדאי להחזיק תוכן. היו בה 25
   * חורים; נשארו תשעה, שכולם אותיות שאין להן מילה עברית טובה.
   */
  it('בחבילה מורחב נשארו רק החורים שאין להם מילה אמיתית', () => {
    const expected: Record<string, string[]> = {
      israelplace: ['ו'],
      seaanimal: ['ג', 'ו', 'ז', 'י', 'ע', 'ר'],
      bird: ['ה', 'ו']
    };
    for (const [categoryId, holes] of Object.entries(expected)) {
      const actual = GAME_LETTERS.filter((l) => pickHintTarget(kb, categoryId, l, none) === null);
      expect(actual, categoryId).toEqual(holes);
    }
  });

  it('בקטגוריות הקלאסיות אין חורים, ולכן שם תמיד יש רמז', () => {
    for (const letter of ['א', 'ב', 'ג', 'מ', 'ש', 'ת']) {
      expect(pickHintTarget(kb, 'country', letter, none)).not.toBeNull();
    }
  });
});

/**
 * החוזה שהמסך מחויב לו. ה-store דורש IndexedDB ולכן אינו נטען כאן,
 * ובדיוק כמו ב-acceptSpelling.test — נבדק המקור עצמו.
 */
describe('המשחק לא גובה קרדיט על כלום', () => {
  const store = read('src/store/gameStore.ts');
  const card = read('src/components/CategoryCard.tsx');

  it('ל-store יש דרך לשאול מראש אם יש בכלל תשובה', () => {
    expect(store).toMatch(/hintAvailable/);
  });

  it('המסך בודק זמינות לפני שהוא מציע לקנות', () => {
    expect(card).toMatch(/hintAvailable/);
  });

  it('אם בכל זאת נגבה תשלום ולא התקבלה תשובה — הקרדיט חוזר', () => {
    // רשת ביטחון: earn() חייב להופיע במסך, לצד spendOnAnswer
    expect(card).toMatch(/\bearn\b/);
  });

  it('כשאין רמז, ארצי אומר את זה במקום לשתוק', () => {
    // המשפט קיים ב-artzi.ts מההתחלה ופשוט לא היה מחובר לשום מקום
    expect(card).toMatch(/artziSays\('noHint'/);
  });
});
