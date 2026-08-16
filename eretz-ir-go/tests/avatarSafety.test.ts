import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isPhotoAvatar } from '../src/lib/identity';

/**
 * הבדיקה הזו נולדה מבאג שהמשתמש ראה על המסך: תמונת הפרופיל מגוגל
 * נשמרה בשדה `avatar`, ומסך הפרופילים הדפיס אותו כטקסט — מחרוזת
 * base64 ענקית שנשפכה על פני הקלף.
 *
 * התיקון היה להפריד את התמונה לשדה משלה ולנתב כל תצוגה דרך רכיב
 * Avatar. הבדיקה כאן אוכפת את החלק השני: אם מישהו יחזור להדפיס
 * `{...avatar}` ישירות ב-JSX, זה ייפול — כי בדיוק כך הבאג נוצר.
 */
const screensDir = resolve(__dirname, '..', 'src/screens');

describe('בטיחות תצוגת אווטאר', () => {
  it('אף מסך לא מדפיס את שדה האווטאר ישירות ב-JSX', () => {
    const offenders: string[] = [];
    for (const file of readdirSync(screensDir).filter((f) => f.endsWith('.tsx'))) {
      const src = readFileSync(resolve(screensDir, file), 'utf8');
      // הדפסה ישירה ב-JSX: {משהו.avatar}. הסתכלות לאחור מוציאה
      // מהכלל העברה כ-prop — `avatar={p.avatar}` היא בדיוק השימוש הנכון.
      const matches = src.match(/(?<!=)\{[A-Za-z0-9_.?]*\.avatar\}/g);
      if (matches) offenders.push(`${file}: ${matches.join(', ')}`);
    }
    expect(
      offenders,
      `יש להשתמש ברכיב <Avatar>, אחרת תמונה שמורה תוצג כמחרוזת base64:\n${offenders.join('\n')}`
    ).toEqual([]);
  });

  it('מזהה נכון מה תמונה ומה אמוג׳י', () => {
    expect(isPhotoAvatar('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(isPhotoAvatar('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
    expect(isPhotoAvatar('🦄')).toBe(false);
    expect(isPhotoAvatar('🙂')).toBe(false);
    expect(isPhotoAvatar('')).toBe(false);
    expect(isPhotoAvatar(undefined)).toBe(false);
    // לא כל data URI הוא תמונה
    expect(isPhotoAvatar('data:text/plain;base64,aGk=')).toBe(false);
  });
});
