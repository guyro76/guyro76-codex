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
  letterCoverage,
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
 * הגרלת האות כשאין אות טובה.
 *
 * `drawLetter` דורש שלפחות 60% מהקטגוריות הנבחרות יהיו מכוסות.
 * בארבעת ה-presets זה תמיד מתקיים — 17 מתוך 17 אותיות כשירות —
 * אבל ילד שבוחר קטגוריות בעצמו יכול להרכיב צירוף של קטגוריות דלות
 * (שיר, להקה, ספר, משחק מחשב, קבוצת ספורט — כולן שמות פרטיים שאין
 * דרך לאמת בלי מקור חיצוני), ובדרגה "קשה" מגיעים לאפס אותיות
 * כשירות.
 *
 * קודם הגיבוי היה הגרלה אחידה, ולכן הילד היה יכול לקבל בדיוק את
 * האות שאין לה אף תשובה באף קטגוריה שבחר. עכשיו הוא מקבל את הטובה
 * שאפשר.
 */
describe('הגרלת אות גם כשהמאגר דל', () => {
  const index = buildLetterIndex(CATEGORIES.flatMap((c) => kb.inCategory(c.id)));
  const thin = ['song', 'band', 'book', 'videogame', 'sportteam'];

  it('בכל ארבעת ה-presets כל האותיות כשירות', () => {
    const order = [...CLASSIC_CATEGORY_IDS, ...CATEGORIES.filter((c) => !c.classic).map((c) => c.id)];
    for (const count of [5, 7, 9, 12]) {
      const ids = order.slice(0, count);
      const min = Math.ceil(ids.length * 0.6);
      const pool = lettersForDifficulty('medium');
      const viable = pool.filter((l) => letterCoverage(l, ids, index) >= min);
      expect(viable.length, `${count} קטגוריות`).toBe(pool.length);
    }
  });

  it('בצירוף דל, האות שמוגרלת היא הטובה שאפשר ולא אות מתה', () => {
    // עוברים על כל ההגרלות האפשריות ומוודאים שאף אחת אינה הגרועה
    const best = Math.max(...lettersForDifficulty('hard').map((l) => letterCoverage(l, thin, index)));
    for (let i = 0; i < 40; i++) {
      const letter = drawLetter(thin, 'hard', index, [], () => i / 40);
      expect(letterCoverage(letter, thin, index), `אות ${letter}`).toBe(best);
    }
  });

  it('האות שמוגרלת תמיד מתוך מאגר האותיות של דרגת הקושי', () => {
    const pool = lettersForDifficulty('hard');
    for (let i = 0; i < 40; i++) {
      expect(pool).toContain(drawLetter(thin, 'hard', index, [], () => i / 40));
    }
  });
});

/**
 * אזהרת "צירוף דל" במסך בחירת הקטגוריות.
 *
 * הבדיקה החשובה כאן היא האחרונה: **שהכפתור באמת מתקן.** הנוסח
 * הראשון הוסיף תמיד שתי קלאסיות, וחישוב הראה שזה לא מספיק — רף
 * ההגרלה הוא 60% מהקטגוריות, אז כל קטגוריה שנוספת מעלה גם את הרף.
 * כפתור "תיקון" שמשאיר את האזהרה על המסך הוא בדיוק הבאג שכל הסבב
 * הזה צד: הילד עושה פעולה, ושום דבר לא משתנה.
 */
describe('אזהרה על צירוף דל, לפני ההגרלה', () => {
  const index = buildLetterIndex(getKnowledgeBase().items);
  const thin = ['song', 'band', 'book', 'videogame', 'sportteam'];
  const order = [...CLASSIC_CATEGORY_IDS, ...CATEGORIES.filter((c) => !c.classic).map((c) => c.id)];

  it('ארבעת ה-presets לעולם לא מקבלים אזהרה, בשום דרגה', () => {
    for (const count of [5, 7, 9, 12]) {
      for (const d of ['easy', 'medium', 'hard'] as const) {
        expect(isThinSelection(order.slice(0, count), d, index), `${count} / ${d}`).toBe(false);
      }
    }
  });

  it('חמש קטגוריות של שמות פרטיים בלבד — מקבלות אזהרה', () => {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      expect(isThinSelection(thin, d, index), d).toBe(true);
    }
  });

  it('האזהרה משתמשת באותו כלל כמו ההגרלה עצמה', () => {
    // צירוף לא דל = יש אותיות כשירות, וההגרלה בוחרת מתוכן בלבד
    const ids = order.slice(0, 9);
    const viable = viableLetters(ids, 'medium', index);
    for (let i = 0; i < 30; i++) {
      expect(viable).toContain(drawLetter(ids, 'medium', index, [], () => i / 30));
    }
  });

  it('הכפתור מוסיף בדיוק מה שצריך — ואחרי הלחיצה האזהרה נעלמת', () => {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const add = categoriesToFixThin(thin, CLASSIC_CATEGORY_IDS, d, index);
      expect(add, d).not.toBeNull();
      expect(isThinSelection([...thin, ...add!], d, index), `${d} אחרי הלחיצה`).toBe(false);
      // וזה המינימום: אחת פחות — האזהרה עוד שם
      if (add!.length > 1) {
        expect(isThinSelection([...thin, ...add!.slice(0, -1)], d, index), `${d} פחות אחת`).toBe(true);
      }
    }
  });

  it('לא מבטיח תיקון שלא נכנס בתקרה של 12', () => {
    // 11 קטגוריות דלות: יש מקום לאחת בלבד, והיא לא מספיקה
    const many = CATEGORIES.filter((c) => c.allowProperNames && !c.classic && c.id !== 'israelplace')
      .map((c) => c.id)
      .slice(0, 11);
    // תנאי מקדים מפורש, אחרת הבדיקה הייתה יכולה לעבור בלי לבדוק כלום
    expect(many).toHaveLength(11);
    expect(isThinSelection(many, 'medium', index)).toBe(true);
    expect(categoriesToFixThin(many, CLASSIC_CATEGORY_IDS, 'medium', index)).toBeNull();
  });
});
