import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SEED_ENTRIES } from '../src/data/seed';
import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../src/data/categories';
import {
  buildLetterIndex,
  categoriesToFixThin,
  drawLetter,
  isThinSelection,
  lettersForDifficulty,
  viableLetters
} from '../src/lib/letters';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { GAME_LETTERS, normalizeHebrew } from '../src/lib/hebrew';
import { validateAnswer } from '../src/lib/validation';

const kb = getKnowledgeBase();
const letters = GAME_LETTERS as unknown as string[];
const coveredLetters = (id: string) => letters.filter((l) => kb.byLetter(id, l).length > 0);

describe('שלמות המאגר', () => {
  /**
   * אותו שם פעמיים באותה קטגוריה אינו רק בזבוז.
   *
   * היו 107 כפילויות כאלה: `MORE_BOY_NAMES`, `MORE_GIRL_NAMES`
   * ו-`MORE_PROFESSIONS` הוסיפו שמות שכבר היו למעלה — אבל **בלי
   * תיאור ובלי עובדה, ועם ניקוד פופולריות אחר**. שתי תוצאות:
   * `pickHintTarget` ממיין לפי פופולריות ובוחר מתוך החמישייה
   * הראשונה, ולכן אותו שם תפס שני מקומות וחזר בתדירות כפולה;
   * וכשנבחר העותק הדל, `buildHint` נפל לנוסח הגנרי
   * ("יש בו N אותיות") במקום לתיאור האמיתי — כלומר אותה מילה
   * נתנה רמז טוב או רמז ריק, לפי הגרלה.
   */
  it('אין שם שמופיע פעמיים באותה קטגוריה', () => {
    const seen = new Map<string, string[]>();
    for (const entry of SEED_ENTRIES) {
      for (const categoryId of entry.c) {
        const key = `${categoryId}|${normalizeHebrew(entry.n)}`;
        seen.set(key, [...(seen.get(key) ?? []), entry.n]);
      }
    }
    const dups = [...seen].filter(([, names]) => names.length > 1).map(([key]) => key);
    expect(dups, `כפילויות: ${dups.join(', ')}`).toEqual([]);
  });

  it('כל ערך מצביע על קטגוריה שקיימת', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    const bad = SEED_ENTRIES.flatMap((e) => e.c.filter((c) => !ids.has(c)).map((c) => `${e.n}->${c}`));
    expect(bad).toEqual([]);
  });

  it('ערך בן שתי מילים לא יושב בקטגוריה שאוסרת זאת', () => {
    const bad: string[] = [];
    for (const entry of SEED_ENTRIES) {
      if (!entry.n.trim().includes(' ')) continue;
      for (const id of entry.c) {
        const cat = CATEGORIES.find((c) => c.id === id);
        if (cat && !cat.allowMultiWord) bad.push(`${entry.n} (${cat.name})`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('אפשר בכלל לשחק בקטגוריה', () => {
  /**
   * הבדיקה שנולדה מהבאג של "פעולה".
   *
   * כל הערכים שם היו בצורת שם הפועל — לרוץ, לקפוץ, לצייר — וכל שם
   * פועל בעברית מתחיל ב-ל'. `validation.startsWithLetter` דורש
   * שהתשובה תתחיל באות שהוגרלה, ולכן 100% מהמילים היו תקועות על
   * אות אחת: ב-21 אותיות מתוך 22 לא הייתה אף תשובה קבילה, ולארצי
   * לא היה מה לרמוז. הקטגוריה נראתה מאוכלסת וספרה שמונה מילים —
   * והייתה בלתי משחקת לחלוטין.
   *
   * ריכוז של כל המילים באות אחת הוא החתימה של התקלה הזו.
   */
  it('אין קטגוריה שכל המילים בה תקועות על אות אחת', () => {
    const bad: string[] = [];
    for (const cat of CATEGORIES) {
      const items = kb.inCategory(cat.id);
      if (items.length < 8) continue; // בקטגוריה זעירה היחס רועש מדי
      const counts = new Map<string, number>();
      for (const item of items) counts.set(item.firstLetter, (counts.get(item.firstLetter) ?? 0) + 1);
      const share = Math.max(...counts.values()) / items.length;
      if (share > 0.6) bad.push(`${cat.name} — ${(share * 100).toFixed(0)}% על אות אחת`);
    }
    expect(bad).toEqual([]);
  });

  /**
   * קטגוריה של שמות עצם רגילים אפשר למלא בלי שום מקור חיצוני,
   * ולכן אין סיבה שתהיה דלה. קטגוריות של שמות פרטיים (שיר, להקה,
   * ספר) נמוכות בכוונה — אימות שלהן דורש ויקישיתוף/Openverse.
   */
  it('קטגוריות של שמות עצם רגילים מכסות לפחות 10 אותיות', () => {
    const thin = CATEGORIES.filter((c) => !c.allowProperNames)
      .map((c) => ({ name: c.name, n: coveredLetters(c.id).length }))
      .filter((r) => r.n < 10);
    expect(thin.map((r) => `${r.name}:${r.n}`)).toEqual([]);
  });

  /** תשע הקלאסיות הן ליבת המשחק, ובהן אין להשאיר אף אות ריקה */
  it('בתשע הקטגוריות הקלאסיות אין אף אות ריקה', () => {
    for (const cat of CATEGORIES.filter((c) => c.classic)) {
      expect(coveredLetters(cat.id).length, cat.name).toBe(letters.length);
    }
  });

  /**
   * הדוגמאות שמוצגות לילד בבחירת הקטגוריות חייבות להיות תשובות
   * שהמשחק באמת מקבל — אחרת הן מלמדות בדיוק את מה שייפסל.
   */
  it('כל דוגמה של קטגוריה היא תשובה שהמשחק מכיר באות שלה', () => {
    const bad: string[] = [];
    for (const cat of CATEGORIES) {
      for (const example of cat.examples) {
        const letter = normalizeHebrew(example).charAt(0);
        if (kb.byLetter(cat.id, letter).length === 0) bad.push(`${cat.name}: "${example}" (${letter})`);
      }
    }
    expect(bad).toEqual([]);
  });
});

/**
 * המספרים ב-SPEC התיישנו בשקט: הוא הצהיר על 1,257 מילים גם אחרי
 * שהמאגר גדל, וגם כשבתוך המספר הזה היו 107 כפילויות. מסמך אפיון
 * שמספר מספר לא נכון גרוע ממסמך שלא מספר כלום, כי מסתמכים עליו.
 */
describe('SPEC מתאר את המאגר שקיים באמת', () => {
  it('מספר המילים ב-SPEC זהה למאגר', () => {
    const spec = readFileSync(resolve(__dirname, '..', 'SPEC.md'), 'utf8');
    const stated = spec.match(/\*\*מילים במאגר\*\*\s*\|\s*\*\*([\d,]+)\*\*/);
    expect(stated, 'השורה "מילים במאגר" נעלמה מ-SPEC').not.toBeNull();
    expect(Number(stated![1].replace(/,/g, ''))).toBe(SEED_ENTRIES.length);
  });

  it('מספר הקטגוריות ב-SPEC זהה לקוד', () => {
    const spec = readFileSync(resolve(__dirname, '..', 'SPEC.md'), 'utf8');
    const stated = spec.match(/\*\*קטגוריות\*\*\s*\|\s*\*\*(\d+)\*\*/);
    expect(stated).not.toBeNull();
    expect(Number(stated![1])).toBe(CATEGORIES.length);
  });
});

/**
 * המאגר נבדק כאן דרך המנגנון שהילד באמת פוגש — `validateAnswer` —
 * ולא רק דרך ספירת אותיות. מילה שקיימת במאגר אבל נפסלת במשחק היא
 * גרועה ממילה שלא קיימת: הילד יודע שהיא נכונה, והמשחק אומר שלא.
 */
describe('התוכן החדש עובר את המאמת האמיתי', () => {
  const check = (raw: string, categoryId: string, letter: string) => {
    const category = CATEGORIES.find((c) => c.id === categoryId)!;
    return validateAnswer({
      raw,
      letter,
      category,
      kb,
      usedInRound: new Set<string>(),
      personalDictionary: new Set<string>()
    }).status;
  };

  it('מילים מהתוכן החדש מתקבלות באות שלהן', () => {
    const cases: [string, string, string][] = [
      ['רוכב', 'verb', 'ר'],
      ['כותב', 'verb', 'כ'],
      ['צוחק', 'verb', 'צ'],
      ['שופר', 'instrument', 'ש'],
      ['עוד', 'instrument', 'ע'],
      ['עקשנות', 'trait', 'ע'],
      ['תסכול', 'emotion', 'ת'],
      ["פיג'מה", 'clothing', 'פ'],
      ['תורמוס', 'flower', 'ת'],
      ['מקק', 'insect', 'מ'],
      ['קונכייה', 'sea', 'ק'],
      ['סכנין', 'israelplace', 'ס'],
      ['חסילון', 'seaanimal', 'ח'],
      ['מיינה', 'bird', 'מ']
    ];
    for (const [raw, categoryId, letter] of cases) {
      expect(check(raw, categoryId, letter), `${raw} / ${categoryId} / ${letter}`).toBe('valid');
    }
  });

  /**
   * המעבר לצורת ההווה ב"פעולה" לא נועד להחליף את מה שהיה. ילד
   * שכותב "לרוץ" באות ל' צודק, וגם ילד שכותב "לרכוב" — שם הפועל
   * נשמר ככינוי של "רוכב" בדיוק בשביל זה.
   */
  it('שם הפועל ממשיך להתקבל באות ל', () => {
    expect(check('לרוץ', 'verb', 'ל')).toBe('valid');
    expect(check('לרכוב', 'verb', 'ל')).toBe('valid');
  });

  it('אות שאינה האות שהוגרלה נפסלת', () => {
    expect(check('רוכב', 'verb', 'כ')).toBe('wrong-letter');
  });
});

/**
 * מנגנון הגרלת האות והאזהרה על צירוף דל.
 *
 * ## למה על אינדקס סינתטי ולא על המאגר
 *
 * בגרסה הראשונה הבדיקות האלה רצו על המאגר האמיתי, עם "חמש
 * הקטגוריות של שמות פרטיים" כדוגמה לצירוף דל. ואז נוסף תוכן לקטגוריות
 * האלה — והצירוף הפסיק להיות דל (2 אותיות כשירות מתוך 17 → 14). שלוש
 * בדיקות נפלו, לא כי המנגנון נשבר אלא כי **המשחק השתפר**. בדיקה
 * שנופלת כשהמוצר משתפר בודקת את הנתונים, לא את הקוד.
 *
 * לכן: המנגנון נבדק כאן על אינדקס שאנחנו בונים, שבו ידוע בדיוק
 * כמה אותיות מכוסות. העובדות על המאגר האמיתי נבדקות בנפרד, למטה.
 */
const MEDIUM = lettersForDifficulty('medium');
const HARD = lettersForDifficulty('hard');

/** אינדקס קטגוריה+אות -> מילים, בנוי ידנית */
function synth(cover: Record<string, readonly string[]>): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const [cat, letters] of Object.entries(cover)) {
    for (const letter of letters) index.set(`${cat}|${letter}`, new Set(['מילה']));
  }
  return index;
}

/** חמש קטגוריות שכל אחת מכסה אות אחת בלבד — ואף אות לא מגיעה ל-60% */
const THIN = ['t1', 't2', 't3', 't4', 't5'];
/** קטגוריות "קלאסיות" סינתטיות שמכסות את כל האותיות */
const FULL = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'];
const thinIndex = synth({
  ...Object.fromEntries(THIN.map((t, i) => [t, [MEDIUM[i]]])),
  ...Object.fromEntries(FULL.map((k) => [k, [...MEDIUM, ...HARD, ...lettersForDifficulty('easy')]]))
});

describe('הגרלת אות כשאין אות טובה', () => {
  it('כשאף אות לא עוברת את הרף — נבחרת זו שמכסה הכי הרבה, לא אות מתה', () => {
    // p מכסה שתי אותיות, q אחת מהן, השאר כלום: הטובה היא MEDIUM[0] עם 2
    const index = synth({ p: [MEDIUM[0], MEDIUM[1]], q: [MEDIUM[0]] });
    const ids = ['p', 'q', 'r', 's', 't']; // רף: 3 מתוך 5 — אף אות לא מגיעה
    expect(viableLetters(ids, 'medium', index)).toEqual([]);
    for (let i = 0; i < 40; i++) {
      expect(drawLetter(ids, 'medium', index, [], () => i / 40)).toBe(MEDIUM[0]);
    }
  });

  it('כשיש אותיות כשירות — ההגרלה רק מתוכן', () => {
    const viable = viableLetters(FULL.slice(0, 5), 'medium', thinIndex);
    expect(viable).toEqual(MEDIUM);
    for (let i = 0; i < 40; i++) {
      expect(viable).toContain(drawLetter(FULL.slice(0, 5), 'medium', thinIndex, [], () => i / 40));
    }
  });

  it('האות שמוגרלת תמיד מתוך מאגר האותיות של הדרגה', () => {
    for (let i = 0; i < 40; i++) {
      expect(HARD).toContain(drawLetter(THIN, 'hard', thinIndex, [], () => i / 40));
    }
  });
});

describe('אזהרה על צירוף דל — המנגנון', () => {
  it('צירוף שבו אף אות לא כשירה — מקבל אזהרה', () => {
    expect(isThinSelection(THIN, 'medium', thinIndex)).toBe(true);
  });

  it('צירוף שבו כל האותיות כשירות — לא מקבל', () => {
    expect(isThinSelection(FULL.slice(0, 5), 'medium', thinIndex)).toBe(false);
  });

  it('צירוף ריק — לא מקבל אזהרה (אין עוד מה להזהיר עליו)', () => {
    expect(isThinSelection([], 'medium', thinIndex)).toBe(false);
  });

  /**
   * הבדיקה החשובה: **שהכפתור באמת מתקן.** הנוסח הראשון הוסיף תמיד שתי
   * קטגוריות, וזה לא הספיק — הרף הוא 60% מהקטגוריות, וכל קטגוריה
   * שנוספת מעלה גם אותו. כפתור "תיקון" שמשאיר את האזהרה הוא באג.
   */
  it('הכפתור מוסיף את המינימום שמספיק — ואחריו האזהרה נעלמת', () => {
    // בדיוק המבנה של המקרה האמיתי: שלוש קטגוריות כמעט ריקות ושתיים מלאות.
    // הרף: 60% מ-5 = 3. אות מכוסה ב-2 בלבד, חוץ משלוש שמגיעות ל-3 —
    // כלומר 3 אותיות כשירות מתוך 17, פחות משליש: דל.
    // מוסיפים k מלאות: צריך 2+k ≥ ⌈0.6·(5+k)⌉, והמינימום הוא k = 3.
    const selected = ['t1', 't2', 't3', 'k1', 'k2'];
    expect(isThinSelection(selected, 'medium', thinIndex)).toBe(true);

    const add = categoriesToFixThin(selected, FULL, 'medium', thinIndex);
    expect(add).toEqual(['k3', 'k4', 'k5']);
    expect(isThinSelection([...selected, ...add!], 'medium', thinIndex)).toBe(false);
    // ואחת פחות — האזהרה עוד שם. זה מה ש"מינימום" אומר.
    expect(isThinSelection([...selected, ...add!.slice(0, -1)], 'medium', thinIndex)).toBe(true);
  });

  it('כשהתיקון לא נכנס בתקרה — null, ולא הבטחה חלקית', () => {
    // חמש קטגוריות של אות אחת צריכות 8 מלאות: 13 — מעל 12
    expect(categoriesToFixThin(THIN, FULL, 'medium', thinIndex)).toBeNull();
  });

  it('לא מבטיח תיקון שלא נכנס בתקרה של 12', () => {
    const many = Array.from({ length: 11 }, (_, i) => `t${i + 1}`);
    const index = synth({
      ...Object.fromEntries(many.map((t, i) => [t, [MEDIUM[i % MEDIUM.length]]])),
      ...Object.fromEntries(FULL.map((k) => [k, MEDIUM]))
    });
    expect(isThinSelection(many, 'medium', index)).toBe(true);
    // נשאר מקום לאחת בלבד, והיא לא מספיקה
    expect(categoriesToFixThin(many, FULL, 'medium', index)).toBeNull();
  });

  it('לא מציע קטגוריה שכבר נבחרה', () => {
    const add = categoriesToFixThin([...THIN, 'k1'], FULL, 'medium', thinIndex);
    expect(add ?? []).not.toContain('k1');
  });
});

/**
 * עובדות על המאגר האמיתי. אלה **אמורות** להיכשל אם התוכן נפגע —
 * בכיוון ההפוך מהבדיקות שלמעלה, שאסור להן להיכשל כשהתוכן משתפר.
 */
describe('המאגר האמיתי והאזהרה', () => {
  const index = buildLetterIndex(getKnowledgeBase().items);
  const order = [...CLASSIC_CATEGORY_IDS, ...CATEGORIES.filter((c) => !c.classic).map((c) => c.id)];

  it('ארבעת ה-presets לעולם לא מקבלים אזהרה, בשום דרגה', () => {
    for (const count of [5, 7, 9, 12]) {
      for (const d of ['easy', 'medium', 'hard'] as const) {
        expect(isThinSelection(order.slice(0, count), d, index), `${count} / ${d}`).toBe(false);
      }
    }
  });

  /**
   * המקרה הגרוע הישן — חמש קטגוריות של שמות פרטיים — נסגר בתוכן:
   * 2 אותיות כשירות מתוך 17 לפני, 14 אחרי. אם זה חוזר, משהו נמחק.
   */
  it('הצירוף הגרוע הישן כבר לא דל', () => {
    const worst = ['song', 'band', 'book', 'videogame', 'sportteam'];
    expect(viableLetters(worst, 'medium', index).length).toBeGreaterThanOrEqual(12);
    expect(isThinSelection(worst, 'medium', index)).toBe(false);
  });

  /**
   * מה שעדיין יכול להיות דל: קטגוריות שהילד המציא. למזהה
   * `custom-<timestamp>` אין אף ערך במאגר, ולכן צירוף שרובו כאלה
   * הוא בדיוק המקום שבו האזהרה נחוצה.
   */
  it('צירוף שרובו קטגוריות אישיות — מקבל אזהרה, ותיקון שעובד', () => {
    const mine = ['custom-1', 'custom-2', 'custom-3', 'country', 'city'];
    expect(isThinSelection(mine, 'medium', index)).toBe(true);
    const add = categoriesToFixThin(mine, CLASSIC_CATEGORY_IDS, 'medium', index);
    expect(add).not.toBeNull();
    expect(isThinSelection([...mine, ...add!], 'medium', index)).toBe(false);
  });
});
