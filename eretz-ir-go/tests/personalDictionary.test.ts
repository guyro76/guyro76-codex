import { describe, expect, it } from 'vitest';
import { validateAnswer } from '../src/lib/validation';
import { getKnowledgeBase } from '../src/lib/knowledge';
import { normalizeHebrew } from '../src/lib/hebrew';
import { CATEGORIES } from '../src/data/categories';

/**
 * המילון האישי — שסתום הביטחון האנושי.
 *
 * כשהמשחק פוסל תשובה שהילד בטוח בה, יש שתי דרכים קדימה: קבלת
 * הצעת כתיב, או **"להוסיף למילון שלי"** — שאחריו המילה אמורה
 * להיחשב תמיד במכשיר הזה.
 *
 * ## הבאג שנמצא
 *
 * הבדיקה של המילון האישי ישבה **מתחת** לבלוק שפוסל מילה שקיימת
 * במאגר תחת קטגוריה אחרת — כלומר אחרי `return`. התוצאה: מילה
 * שההורה אישר במפורש נדחתה בכל זאת, בדיוק במקרה שבו הפיצ'ר נועד
 * לעזור. שסתום הביטחון לא עשה כלום, בשקט.
 */
const kb = getKnowledgeBase();
const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;
const empty = new Set<string>();

const check = (raw: string, letter: string, categoryId: string, personal: string[] = []) =>
  validateAnswer({
    raw,
    letter,
    category: cat(categoryId),
    kb,
    usedInRound: empty,
    personalDictionary: new Set(personal.map((w) => normalizeHebrew(w)))
  });

describe('מילון אישי גובר על קטגוריה שגויה', () => {
  /**
   * "ורד" קיים במאגר כצמח. ילד שכתב אותו בקטגוריית "חי" נפסל —
   * וזה תקין. אבל אחרי שההורה אישר, הוא חייב להתקבל.
   */
  it('מילה שאושרה מתקבלת גם כשהיא קיימת במאגר בקטגוריה אחרת', () => {
    const before = check('ורד', 'ו', 'animal');
    expect(before.status).not.toBe('valid');

    const after = check('ורד', 'ו', 'animal', ['ורד']);
    expect(after.status, 'אישור ההורה לא עזר — השסתום לא עובד').toBe('valid');
    expect(after.verificationSource).toBe('personal');
  });

  it('מילה שלא במאגר בכלל מתקבלת אחרי אישור', () => {
    const made = 'זלגוביץ';
    expect(check(made, 'ז', 'city').status).not.toBe('valid');
    expect(check(made, 'ז', 'city', [made]).status).toBe('valid');
  });

  /** המאגר עדיין קודם: מילה שנמצאת בקטגוריה הנכונה אינה "אישית" */
  it('מילה שבמאגר בקטגוריה הנכונה נשארת אימות מהמאגר', () => {
    const r = check('חיפה', 'ח', 'city', ['חיפה']);
    expect(r.status).toBe('valid');
    expect(r.verificationSource).toBe('local-db');
  });
});

/**
 * מה שאישור הורה **אינו** יכול לעקוף. אלה עובדות ולא דעות, ואם
 * המילון האישי היה גובר גם עליהן הוא היה הופך לדלת אחורית.
 */
describe('גבולות המילון האישי', () => {
  it('אינו עוקף אות שגויה', () => {
    expect(check('ורד', 'ב', 'animal', ['ורד']).status).toBe('wrong-letter');
  });

  it('אינו עוקף כלל של מילה אחת', () => {
    const r = validateAnswer({
      raw: 'שתי מילים',
      letter: 'ש',
      category: cat('boyname'),
      kb,
      usedInRound: empty,
      personalDictionary: new Set([normalizeHebrew('שתי מילים')])
    });
    expect(r.status).toBe('wrong-category');
  });

  it('אינו עוקף כלל של עברית בלבד', () => {
    expect(check('haifa', 'ח', 'city', ['haifa']).status).toBe('wrong-category');
  });

  it('אינו מתיר את אותה תשובה פעמיים באותו סיבוב', () => {
    const r = validateAnswer({
      raw: 'ורד',
      letter: 'ו',
      category: cat('animal'),
      kb,
      usedInRound: new Set([normalizeHebrew('ורד')]),
      personalDictionary: new Set([normalizeHebrew('ורד')])
    });
    expect(r.status).not.toBe('valid');
  });
});
