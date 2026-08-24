import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BASE_UNIQUE, completionBonus, scoreAnswer } from '../src/lib/scoring';
import type { SubmittedAnswer } from '../src/types';

const root = resolve(__dirname, '..');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

/**
 * קבלת הצעת כתיב ("כן, התכוונתי ל־X").
 *
 * הלוגיקה יושבת ב-`gameStore`, שדורש IndexedDB ולכן אינו נטען
 * בסביבת הבדיקות הזו. לכן נבדקים כאן שני דברים שאפשר לבדוק באמת:
 * החישוב עצמו — באותה `scoreAnswer` שהחנות משתמשת בה — והחוזה
 * שהחנות מחויבת לו, ברמת המקור.
 */
const answer = (over: Partial<SubmittedAnswer> = {}): SubmittedAnswer =>
  ({
    categoryId: 'city',
    rawText: 'חדרא',
    normalizedText: 'חדרא',
    letter: 'ח',
    validation: { status: 'spelling', reason: 'אולי התכוונת ל"חדרה"?', suggestion: 'חדרה', verificationSource: 'local-db' },
    hintsUsed: 0,
    revealed: false,
    typedAtMs: 3000,
    baseScore: 0,
    originality: 70,
    originalityBonus: 0,
    speedBonus: 0,
    noHintBonus: 0,
    discoveryBonus: 0,
    totalScore: 0,
    duplicateWithOtherPlayer: false,
    ...over
  }) as SubmittedAnswer;

describe('חישוב הניקוד אחרי תיקון כתיב', () => {
  const rescore = (a: SubmittedAnswer, roundSeconds = 60) =>
    scoreAnswer({
      isValid: true,
      revealed: a.revealed,
      duplicateWithOtherPlayer: a.duplicateWithOtherPlayer,
      hintsUsed: a.hintsUsed,
      originality: a.originality,
      typedAtMs: a.typedAtMs,
      roundSeconds,
      isNewDiscovery: false
    });

  it('תשובה מתוקנת מקבלת ניקוד בסיס מלא', () => {
    expect(rescore(answer()).base).toBe(BASE_UNIQUE);
    expect(rescore(answer()).total).toBeGreaterThan(0);
  });

  /**
   * השגיאה הייתה בכתיב ולא באיטיות — הילד באמת הקליד בזמן, ולכן
   * בונוס המהירות נשמר. לשלול אותו היה ענישה כפולה על אותה אות.
   */
  it('בונוס המהירות נשמר לפי זמן ההקלדה המקורי', () => {
    expect(rescore(answer({ typedAtMs: 3000 }), 60).speedBonus).toBeGreaterThan(0);
    expect(rescore(answer({ typedAtMs: 55_000 }), 60).speedBonus).toBe(0);
  });

  it('רמזים שנוצלו עדיין מקוזזים', () => {
    expect(rescore(answer({ hintsUsed: 2 })).hintPenalty).toBeGreaterThan(0);
    expect(rescore(answer({ hintsUsed: 0 })).noHintBonus).toBe(3);
  });

  /**
   * תשובה שנחשפה היא למידה ולא ניקוד. תיקון כתיב לא אמור לעקוף את
   * הכלל הזה — אחרת אפשר לחשוף, לכתוב בשגיאה, ולאשר.
   */
  it('תשובה שנחשפה נשארת ללא ניקוד גם אחרי תיקון', () => {
    expect(rescore(answer({ revealed: true })).total).toBe(0);
  });

  it('לא מוענק בונוס גילוי על תיקון כתיב', () => {
    expect(rescore(answer()).discoveryBonus).toBe(0);
  });

  /** תיקון התשובה האחרונה משלים את הלוח, ולכן מזכה בבונוס ההשלמה */
  it('תיקון שמשלים את כל הקטגוריות מזכה בבונוס השלמה', () => {
    const valid = { ...answer(), validation: { ...answer().validation, status: 'valid' as const } };
    expect(completionBonus([valid], 1)).toBeGreaterThan(0);
    expect(completionBonus([answer()], 1)).toBe(0);
  });
});

describe('החוזה של acceptSpelling', () => {
  const store = read('src/store/gameStore.ts');

  /**
   * שני המסלולים — סיום סיבוב ותיקון כתיב — חייבים לחשב ניקוד
   * באותה דרך. אם אחד מהם יקבל נוסחה משלו, ניקוד המשחק יתחיל
   * להיסתר בשקט לפי איך שהגעת אליו.
   */
  it('משתמש באותה scoreAnswer ובאותו completionBonus כמו סיום סיבוב', () => {
    expect(store).toContain('acceptSpelling');
    const fn = store.slice(store.indexOf('acceptSpelling: (categoryId'));
    expect(fn).toContain('scoreAnswer(');
    expect(fn).toContain('completionBonus(');
  });

  /** רק תשובה שנפסלה על כתיב ניתנת לאישור — לא כל תשובה שגויה */
  it('מאשר רק תשובות בסטטוס spelling', () => {
    const fn = store.slice(store.indexOf('acceptSpelling: (categoryId'));
    expect(fn).toContain("!== 'spelling'");
  });

  /** הניקוד הכולל מתוקן ולא נצבר פעמיים */
  it('מחליף את ניקוד הסיבוב במקום להוסיף עליו', () => {
    const fn = store.slice(store.indexOf('acceptSpelling: (categoryId'));
    expect(fn).toContain('p.totalScore - p.roundScore + roundScore');
  });
});

describe('המסך כבר לא מוביל למבוי סתום', () => {
  const screen = read('src/screens/RoundResults.tsx');

  it('הצעת כתיב מוצגת ככפתור לחיץ ולא כטקסט בלבד', () => {
    expect(screen).toContain('acceptSpelling');
    expect(screen).toContain('כן, התכוונתי');
  });

  /**
   * קודם הייתה כאן פעולה אחת בלבד שהילד לא יכול לסגור בעצמו.
   * עכשיו יש לצידה פעולה שהיא כן שלו.
   */
  it('לתשובה לא מוכרת יש גם פעולה שהילד יכול לעשות בעצמו', () => {
    expect(screen).toContain('להוסיף למילון שלי');
    expect(screen).toContain('personalAnswers');
  });

  /**
   * מילה שילד אישר לעצמו אינה ידע מאומת, ואסור שתיכנס למאגר
   * המשותף שממנו נבנים אוסף המילים והתמונות.
   */
  it('המילה נשמרת במילון האישי ולא במאגר הידע המשותף', () => {
    const fn = screen.slice(screen.indexOf('const learn ='), screen.indexOf('const appeal ='));
    expect(fn).toContain('db.personalAnswers.add');
    expect(fn).not.toContain('userKnowledge');
    expect(fn).not.toContain('addUserItems');
  });

  /** ההסבר הוא טקסט פונקציונלי, ולכן לא מעומעם — כלל הברזל */
  it('הסיבה לפסילה אינה מוצגת ב-dim', () => {
    expect(screen).toContain('why-failed');
    const css = read('src/styles/global.css');
    expect(css).toMatch(/\.why-failed\s*\{[^}]*font-weight:\s*700/);
    expect(css).toMatch(/\.why-failed\s*\{[^}]*color:\s*var\(--text\)/);
  });
});
