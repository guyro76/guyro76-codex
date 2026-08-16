import { describe, expect, it } from 'vitest';
import { DEFAULT_AGE, MAX_AGE, MIN_AGE, clampAge, sanitizeAgeInput } from '../src/lib/ageField';

/**
 * הבאג שדווח: מקלידים "1" ומקבלים "51". הערך נצמד לתחום החוקי בכל
 * הקלדה בודדת, השדה נכתב מחדש כ-"5", והתו הבא הצטרף אליו.
 */
describe('שדה הגיל', () => {
  it('מותר להקליד ולמחוק בלי שהשדה ייכתב מחדש', () => {
    expect(sanitizeAgeInput('')).toBe('');
    expect(sanitizeAgeInput('1')).toBe('1');
    expect(sanitizeAgeInput('12')).toBe('12');
  });

  it('אותיות וסימנים לא נכנסים בכלל', () => {
    expect(sanitizeAgeInput('1a2')).toBe('12');
    expect(sanitizeAgeInput('אב')).toBe('');
    expect(sanitizeAgeInput('-5')).toBe('5');
    expect(sanitizeAgeInput('1.5')).toBe('15');
  });

  it('לכל היותר שתי ספרות', () => {
    expect(sanitizeAgeInput('123456')).toBe('12');
  });

  it('ההצמדה לתחום קורית רק בסיום', () => {
    expect(clampAge('1')).toBe(MIN_AGE);
    expect(clampAge('12')).toBe(12);
    expect(clampAge('99')).toBe(99);
    expect(clampAge('120')).toBe(MAX_AGE);
  });

  it('שדה ריק חוזר לערך הקודם ולא לאפס', () => {
    expect(clampAge('', 9)).toBe(9);
    expect(clampAge('   ', 9)).toBe(9);
    expect(clampAge('')).toBe(DEFAULT_AGE);
  });

  /**
   * שחזור מדויק של התקלה: מוחקים, מקלידים 1, ואז 2. אם ההצמדה
   * הייתה רצה תוך כדי, התוצאה הייתה 51 במקום 12.
   */
  it('הקלדה תו אחר תו נותנת בדיוק את מה שהוקלד', () => {
    let text = '11';
    text = sanitizeAgeInput('');
    text = sanitizeAgeInput(text + '1');
    expect(text).toBe('1');
    text = sanitizeAgeInput(text + '2');
    expect(text).toBe('12');
    expect(clampAge(text)).toBe(12);
  });
});
