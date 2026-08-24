import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { QUICK_PHRASES, isKnownPhrase, phraseById, phraseLabel } from '../src/lib/quickChat';
import { buildChallenge, decodeChallenge, encodeChallenge, type Challenge } from '../src/lib/challenge';
import { CHALLENGE_VERSION } from '../src/lib/challenge';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const payloadOf = (o: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(o));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base: Challenge = {
  v: CHALLENGE_VERSION,
  id: 'ab3k9m',
  by: 'אורי',
  letter: 'ב',
  cats: ['country', 'city'],
  secs: 60,
  pts: [10, 5]
};

describe('הרשימה סגורה, ולכן זה לא צ׳אט', () => {
  /**
   * הבדיקה המרכזית בקובץ. מה שהופך את זה למשפטים מוכנים ולא לצ'אט
   * הוא שבקישור נוסע **מספר**. אם מישהו יוסיף שדה טקסט, הכלל
   * "ללא צ'אט פתוח בין ילדים" נשבר — והבדיקה הזו היא מה שיתפוס.
   */
  it('בקישור נוסע מזהה מספרי ולא מחרוזת', () => {
    const c = buildChallenge({
      nickname: 'אורי',
      letter: 'ב',
      categories: [{ id: 'country' }],
      seconds: 60,
      pointsByCategory: { country: 10 },
      messageId: 2
    })!;
    expect(typeof c.msg).toBe('number');
    // הטקסט עצמו לא נמצא במטען בשום צורה
    expect(JSON.stringify(c)).not.toContain(QUICK_PHRASES[1].text);
  });

  it('מזהה שאינו ברשימה נזרק, והאתגר עדיין בר-משחק', () => {
    const out = decodeChallenge(payloadOf({ ...base, msg: 9999 }));
    expect(out).not.toBeNull();
    expect(out!.msg).toBeUndefined();
  });

  /** הניסיון הישיר להבריח טקסט: לשים מחרוזת במקום המזהה */
  it('טקסט במקום מזהה נזרק ולא מוצג', () => {
    for (const msg of ['בוא ניפגש בפארק', { text: 'שלום' }, ['x'], 1.5, -3, null]) {
      const out = decodeChallenge(payloadOf({ ...base, msg }));
      expect(out, JSON.stringify(msg)).not.toBeNull();
      expect(out!.msg, JSON.stringify(msg)).toBeUndefined();
    }
  });

  it('מזהה תקף עובר הלוך ושוב', () => {
    const out = decodeChallenge(encodeChallenge({ ...base, msg: 5 }));
    expect(out!.msg).toBe(5);
    expect(phraseById(out!.msg)!.text).toBe(QUICK_PHRASES[4].text);
  });

  it('אין תיבת הקלדה בשורת ההודעות', () => {
    const src = read('src/components/QuickChatBar.tsx');
    expect(src).not.toMatch(/<input|<textarea|contentEditable/);
  });
});

describe('הרשימה היא append-only', () => {
  /**
   * המזהים נוסעים בקישורים שכבר נשלחו. שינוי טקסט של מזהה קיים
   * משנה למפרע מה שילד אמר — מי שכתב "בהצלחה" יגלה שאמר משהו אחר.
   * הבדיקה נועלת את המשמעות של כל מזהה שכבר קיים.
   */
  it('המשמעות של מזהה קיים אינה משתנה', () => {
    const locked: Record<number, string> = {
      1: 'בהצלחה!',
      2: 'כל הכבוד!',
      3: 'וואו, קשה!',
      4: 'תנסה לעבור את זה',
      5: 'היה כיף',
      6: 'עוד סיבוב?',
      7: 'הפעם אני מנצח',
      8: 'משחק יפה'
    };
    for (const [id, text] of Object.entries(locked)) {
      expect(phraseById(Number(id))?.text, `מזהה ${id}`).toBe(text);
    }
  });

  it('אין מזהים כפולים', () => {
    const ids = QUICK_PHRASES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('תוכן המשפטים', () => {
  /**
   * רשימה שמכילה "הפסדת!" או "חלש" הופכת כל משחק לכלי לעג, גם בלי
   * טקסט חופשי. אין דרך לבדוק "נחמדות" אוטומטית, אבל אפשר לנעול
   * את מה שאסור להופיע.
   */
  it('אין משפט שאפשר להשתמש בו כעלבון', () => {
    const all = QUICK_PHRASES.map((p) => p.text).join(' ');
    expect(all).not.toMatch(/הפסדת|חלש|גרוע|טיפש|לוזר|נוראי/);
  });

  it('כל משפט קצר, עם אייקון ובלי שורות חדשות', () => {
    for (const p of QUICK_PHRASES) {
      expect(p.text.length, p.text).toBeLessThanOrEqual(20);
      expect(p.text).not.toContain('\n');
      expect(p.icon.length, p.text).toBeGreaterThan(0);
    }
  });
});

describe('עזרי תצוגה', () => {
  it('מזהה לא מוכר לא מייצר תווית', () => {
    expect(phraseLabel(999)).toBeNull();
    expect(phraseLabel(undefined)).toBeNull();
    expect(phraseLabel(null)).toBeNull();
  });

  it('isKnownPhrase מזהה רק ערכים שברשימה', () => {
    expect(isKnownPhrase(1)).toBe(true);
    expect(isKnownPhrase(999)).toBe(false);
    expect(isKnownPhrase('1')).toBe(false);
    expect(isKnownPhrase(undefined)).toBe(false);
  });
});
