import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_VERSION,
  MAX_NICKNAME,
  buildChallenge,
  challengeInviteText,
  challengeLink,
  challengeTotal,
  compareToChallenge,
  decodeChallenge,
  encodeChallenge,
  readChallengeFromHash,
  sanitizeNickname,
  type Challenge
} from '../src/lib/challenge';

const base: Challenge = {
  v: CHALLENGE_VERSION,
  id: 'ab3k9m',
  by: 'אורי',
  letter: 'ב',
  cats: ['country', 'city', 'animal'],
  secs: 60,
  pts: [10, 5, 13]
};

/** מקצר: מקודד אובייקט כלשהו כמטען, גם כזה שלא היה עובר בנייה */
const payloadOf = (o: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(o));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

describe('אריזה ופתיחה של אתגר', () => {
  it('מה שנארז נפתח זהה', () => {
    expect(decodeChallenge(encodeChallenge(base))).toEqual(base);
  });

  it('עובר דרך עברית בלי להישבר', () => {
    const c = { ...base, by: 'נועה' };
    expect(decodeChallenge(encodeChallenge(c))?.by).toBe('נועה');
  });

  it('המטען יושב ב-hash ולא ב-query', () => {
    // hash לא נשלח לשרת בבקשת הדף — זו כל הסיבה שאין כאן שרת
    const link = challengeLink(base);
    expect(link).toContain('#c=');
    expect(link).not.toContain('?c=');
  });

  it('נקרא בחזרה מתוך ה-hash', () => {
    const hash = new URL(challengeLink(base)).hash;
    expect(readChallengeFromHash(hash)).toEqual(base);
    expect(readChallengeFromHash('')).toBeNull();
    expect(readChallengeFromHash('#other=1')).toBeNull();
  });
});

describe('מטען פגום נדחה במלואו', () => {
  /**
   * הכלל: אין פענוח חלקי. אתגר שחציו הגיוני יגרום למסך להתנהג
   * מוזר במקום להגיד "הקישור לא תקין".
   */
  it('זבל, ריק ו-JSON לא תקין', () => {
    for (const bad of ['', '   ', 'not-base64!!', payloadOf('just a string'), payloadOf([1, 2, 3])]) {
      expect(decodeChallenge(bad), bad).toBeNull();
    }
  });

  it('גרסה אחרת נדחית ולא מפוענחת חלקית', () => {
    expect(decodeChallenge(payloadOf({ ...base, v: 99 }))).toBeNull();
    expect(decodeChallenge(payloadOf({ ...base, v: undefined }))).toBeNull();
  });

  it('אות שאינה אות משחק', () => {
    for (const letter of ['', 'Q', 'בב', 'ם', '1']) {
      expect(decodeChallenge(payloadOf({ ...base, letter })), letter).toBeNull();
    }
  });

  it('מספר הניקודים חייב להתאים למספר הקטגוריות', () => {
    expect(decodeChallenge(payloadOf({ ...base, pts: [10, 5] }))).toBeNull();
    expect(decodeChallenge(payloadOf({ ...base, pts: [] }))).toBeNull();
  });

  it('קטגוריה כפולה נדחית — היא הייתה מוצגת פעמיים ומכפילה ניקוד', () => {
    expect(decodeChallenge(payloadOf({ ...base, cats: ['city', 'city'], pts: [5, 5] }))).toBeNull();
  });

  it('ניקוד שלילי, אינסופי או ענק', () => {
    for (const pts of [[-5, 5, 5], [Infinity, 5, 5], [1e9, 5, 5]]) {
      expect(decodeChallenge(payloadOf({ ...base, pts })), String(pts)).toBeNull();
    }
  });

  it('מזהה קטגוריה שאינו במבנה שלנו', () => {
    for (const cats of [['<script>'], ['שלום'], ['a'], ['UPPER']]) {
      expect(decodeChallenge(payloadOf({ ...base, cats, pts: [5] })), String(cats)).toBeNull();
    }
  });

  it('בלי קטגוריות בכלל, או יותר מדי', () => {
    expect(decodeChallenge(payloadOf({ ...base, cats: [], pts: [] }))).toBeNull();
    const many = Array.from({ length: 40 }, (_, i) => `cat${i}`);
    expect(decodeChallenge(payloadOf({ ...base, cats: many, pts: many.map(() => 1) }))).toBeNull();
  });
});

describe('הכינוי אינו ערוץ הודעות', () => {
  /**
   * זו הבדיקה החשובה בקובץ. הכלל "בלי צ'אט פתוח בין ילדים" נשבר
   * ברגע שאפשר להעביר טקסט חופשי מילד לילד — לא משנה באיזה שדה.
   */
  it('מסיר סימני פיסוק, אימוג׳י ושורות חדשות', () => {
    expect(sanitizeNickname('בוא\nניפגש בפארק ב-5!')).not.toContain('\n');
    expect(sanitizeNickname('אורי 😈🔥')).toBe('אורי');
    // מה שחשוב אינו המחרוזת המדויקת אלא שהתווים המסוכנים אינם שורדים
    expect(sanitizeNickname('<script>alert(1)</script>')).not.toMatch(/[<>()/]/);
  });

  it('קוצץ לאורך קבוע', () => {
    const long = 'א'.repeat(200);
    expect(sanitizeNickname(long).length).toBeLessThanOrEqual(MAX_NICKNAME);
  });

  it('כינוי ריק מקבל ברירת מחדל ולא נשאר ריק', () => {
    expect(sanitizeNickname('')).toBe('שחקן');
    expect(sanitizeNickname('!!!')).toBe('שחקן');
  });

  /**
   * ניקוי בבנייה הוא בקשה יפה מהשולח. ניקוי **בפענוח** הוא מה
   * שמגן, כי מי ששולח את הקישור יכול לערוך אותו ביד.
   */
  it('מנוקה גם בפענוח, לא רק בבנייה', () => {
    const smuggled = payloadOf({ ...base, by: 'תבוא אליי הביתה עכשיו!!! 😈' });
    const out = decodeChallenge(smuggled);
    expect(out).not.toBeNull();
    expect(out!.by.length).toBeLessThanOrEqual(MAX_NICKNAME);
    expect(out!.by).not.toContain('!');
    expect(out!.by).not.toContain('😈');
  });
});

describe('בניית אתגר מסיבוב שנגמר', () => {
  const input = {
    nickname: 'אורי',
    letter: 'ב',
    categories: [{ id: 'country' }, { id: 'city' }, { id: 'animal' }],
    seconds: 60,
    pointsByCategory: { country: 10, city: 5, animal: 13 }
  };

  it('אורז את האות, הקטגוריות והניקוד לפי הסדר', () => {
    const c = buildChallenge(input)!;
    expect(c.letter).toBe('ב');
    expect(c.cats).toEqual(['country', 'city', 'animal']);
    expect(c.pts).toEqual([10, 5, 13]);
    expect(challengeTotal(c)).toBe(28);
  });

  it('כל אתגר מקבל מזהה משלו', () => {
    expect(buildChallenge(input)!.id).not.toBe(buildChallenge(input)!.id);
  });

  /**
   * קטגוריה שההורה יצר קיימת רק במכשיר שלו. אתגר שמפנה אליה היה
   * נפתח אצל החבר כקטגוריה ריקה בלי שם.
   */
  it('מסנן קטגוריות מותאמות אישית', () => {
    const c = buildChallenge({
      ...input,
      categories: [{ id: 'country' }, { id: 'mycat', custom: true }],
      pointsByCategory: { country: 10, mycat: 40 }
    })!;
    expect(c.cats).toEqual(['country']);
    expect(challengeTotal(c)).toBe(10);
  });

  it('בלי קטגוריות מובנות אין אתגר בכלל', () => {
    expect(
      buildChallenge({ ...input, categories: [{ id: 'mycat', custom: true }] })
    ).toBeNull();
  });

  it('אות שאינה אות משחק לא מייצרת אתגר', () => {
    expect(buildChallenge({ ...input, letter: 'ץ' })).toBeNull();
  });

  it('קטגוריה בלי ניקוד נספרת כאפס ולא כ-undefined', () => {
    const c = buildChallenge({ ...input, pointsByCategory: { country: 10 } })!;
    expect(c.pts).toEqual([10, 0, 0]);
  });

  it('משחק בלי הגבלת זמן נשמר כאפס', () => {
    expect(buildChallenge({ ...input, seconds: 0 })!.secs).toBe(0);
  });
});

describe('השוואת התוצאה', () => {
  it('ניצחון, הפסד ותיקו', () => {
    expect(compareToChallenge(base, 30).outcome).toBe('win');
    expect(compareToChallenge(base, 10).outcome).toBe('lose');
    expect(compareToChallenge(base, 28).outcome).toBe('tie');
  });

  it('ההפרש תמיד חיובי', () => {
    expect(compareToChallenge(base, 30).gap).toBe(2);
    expect(compareToChallenge(base, 10).gap).toBe(18);
  });
});

describe('טקסט ההזמנה', () => {
  const text = challengeInviteText(base);

  /** מה שנוסע בוואטסאפ הוא מה שהילד לא יכול לשלוט בו — ולכן נבדק */
  it('מכיל את האות, מספר הקטגוריות והניקוד לניצוח', () => {
    expect(text).toContain('ב');
    expect(text).toContain('28');
    expect(text).toContain(challengeLink(base));
  });

  it('לא מכיל תשובות — הן לא נשלחות מלכתחילה', () => {
    expect(base).not.toHaveProperty('answers');
    expect(text).not.toMatch(/תשוב/);
  });
});
