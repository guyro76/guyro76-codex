import { describe, expect, it } from 'vitest';
import {
  FREE_FEATURES,
  PAID_FEATURES,
  PLANS,
  lifetimeBreakEvenMonths,
  perMonth,
  savingsPercent
} from '../src/data/plans';

const byId = (id: string) => PLANS.find((p) => p.id === id)!;

describe('סולם החבילות', () => {
  it('ארבעה משכים, כפי שהוגדר', () => {
    expect(PLANS.map((p) => p.id)).toEqual(['q', 'h', 'y', 'life']);
  });

  /**
   * הכלל שמחזיק את כל הסולם: כל חבילה ארוכה יותר זולה יותר לחודש.
   * סולם שלא עושה את זה מרגיש שרירותי, וההורה קולט את זה מיד.
   */
  it('כל מדרגה מורידה את המחיר לחודש', () => {
    const monthly = PLANS.filter((p) => p.months).map((p) => perMonth(p)!);
    for (let i = 1; i < monthly.length; i++) {
      expect(monthly[i], `מדרגה ${i} לא זולה יותר`).toBeLessThan(monthly[i - 1]);
    }
  });

  it('החיסכון נגזר מהמחיר ולא נכתב ביד', () => {
    // 29.90/3 = 9.9667 לחודש; 79.90/12 = 6.658 → כ-33%
    expect(savingsPercent(byId('q'))).toBe(0);
    expect(savingsPercent(byId('h'))).toBeGreaterThan(10);
    expect(savingsPercent(byId('y'))).toBeGreaterThan(savingsPercent(byId('h')));
  });

  it('לרכישה חד-פעמית אין מחיר לחודש ואין אחוז חיסכון', () => {
    expect(perMonth(byId('life'))).toBeNull();
    expect(savingsPercent(byId('life'))).toBe(0);
  });

  /**
   * היחס המקובל בענף הוא 2.5–3 שנות מנוי. פחות מזה — "לכל החיים"
   * אוכלת את המנוי המתחדש; הרבה יותר — אף אחד לא קונה אותה.
   */
  it('"לכל החיים" היא בין 2.5 ל-3 שנות מנוי', () => {
    const ratio = byId('life').price / byId('y').price;
    expect(ratio).toBeGreaterThanOrEqual(2.4);
    expect(ratio).toBeLessThanOrEqual(3.1);
    expect(lifetimeBreakEvenMonths()).toBeGreaterThanOrEqual(28);
  });

  /**
   * ההשוואה שקבעה את התקרה: חבילת Sago Mini + Toca Boca עולה 29.99$
   * לשנה והיא כ-10 אפליקציות. משחק אחד שעולה יותר מזה הוא בדיוק
   * הטענה שרצינו למנוע.
   */
  it('המנוי השנתי יושב מתחת לחבילה של המתחרים', () => {
    const USD = 3.7; // שער מקורב, לצורך סדר גודל בלבד
    expect(byId('y').price / USD).toBeLessThan(29.99);
  });

  it('רק חבילה אחת מסומנת כמומלצת', () => {
    expect(PLANS.filter((p) => p.recommended)).toHaveLength(1);
    expect(byId('y').recommended).toBe(true);
  });

  /**
   * הגרסה החינמית כוללת פרסומות, וזו החלטה מסחרית מפורשת. מה
   * שאסור הוא להסתיר אותה: הורה שמגלה פרסומות רק אחרי ההורדה
   * מרגיש מרומה, וזו ביקורת של כוכב אחד בחנות.
   *
   * הבדיקה נועלת את הגילוי — לא את קיום הפרסומות.
   */
  it('הגרסה החינמית מצהירה על הפרסומות ולא מסתירה אותן', () => {
    expect(FREE_FEATURES.join(' ')).toMatch(/פרסומות/);
  });

  /** ומה שמשלמים עליו קודם כול — שקט מפרסומות */
  it('החבילה בתשלום מבטיחה בלי פרסומות', () => {
    expect(PAID_FEATURES.join(' ')).toMatch(/בלי פרסומות/);
    expect(PAID_FEATURES.length).toBeGreaterThan(3);
  });
});
